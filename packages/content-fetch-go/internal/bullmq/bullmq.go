// Package queue implements BullMQ-compatible Redis queue operations.
//
// BullMQ v5 stores jobs as Redis hashes at bull:{queue}:{jobId}
// and manages state via lists/sorted-sets:
//   - bull:{queue}:wait      LIST   (pending, LIFO insertion LPUSH, LPOP consumption)
//   - bull:{queue}:active    LIST   (currently processing)
//   - bull:{queue}:completed ZSET   (done, score=timestamp)
//   - bull:{queue}:failed    ZSET   (failed, score=timestamp)
//   - bull:{queue}:prioritized ZSET (priority queue, score encodes priority+counter)
//   - bull:{queue}:id        STRING (atomic ID counter)
//
// Workers use a Lua moveToActive script. For the consumer side we replicate
// a simplified version that is compatible with existing BullMQ producers and
// consumers (i.e. jobs added here can be consumed by the TS worker, and vice-versa).
package bullmq

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	bullPrefix = "bull"

	// Queue names
	ContentFetchQueue = "omnivore-content-fetch-queue"
	BackendQueue      = "omnivore-backend-queue"

	// Job names
	SavePageJob = "save-page"

	// removeOnComplete/removeOnFail ages (seconds) – match TS defaults
	completeAge = 3600
	failAge     = 86400
)

// queueKey returns the base key prefix for a BullMQ queue.
func queueKey(queueName string) string {
	return fmt.Sprintf("%s:%s", bullPrefix, queueName)
}

func waitKey(q string) string      { return queueKey(q) + ":wait" }
func activeKey(q string) string    { return queueKey(q) + ":active" }
func completedKey(q string) string { return queueKey(q) + ":completed" }
func failedKey(q string) string    { return queueKey(q) + ":failed" }
func idKey(q string) string        { return queueKey(q) + ":id" }
func metaKey(q string) string      { return queueKey(q) + ":meta" }
func jobKey(q, id string) string   { return queueKey(q) + ":" + id }
func prioritizedKey(q string) string { return queueKey(q) + ":prioritized" }
func eventsKey(q string) string    { return queueKey(q) + ":events" }

// JobOpts mirrors BullMQ BulkJobOptions.
type JobOpts struct {
	Attempts int        `json:"attempts"`
	Priority int        `json:"priority"`
	Backoff  BackoffOpt `json:"backoff"`
	// removeOnComplete and removeOnFail are not stored in opts hash but handled by cleanup
}

type BackoffOpt struct {
	Type  string `json:"type"`
	Delay int    `json:"delay"`
}

// RawJob is a job as stored in Redis.
type RawJob struct {
	ID          string
	Name        string
	Data        json.RawMessage
	Opts        JobOpts
	Timestamp   int64
	AttemptsMade int
}

// nextJobID atomically increments and returns a new job ID.
func nextJobID(ctx context.Context, rdb *redis.Client, queueName string) (string, error) {
	id, err := rdb.Incr(ctx, idKey(queueName)).Result()
	if err != nil {
		return "", err
	}
	return strconv.FormatInt(id, 10), nil
}

// AddJobOpts carries parameters for adding a single job.
type AddJobOpts struct {
	Name     string
	Data     interface{}
	Opts     JobOpts
}

// AddBulk adds multiple jobs to a BullMQ queue, replicating addBulk() semantics.
// Each job is stored as a hash and its ID appended to the appropriate list/zset.
func AddBulk(ctx context.Context, rdb *redis.Client, queueName string, jobs []AddJobOpts) error {
	for _, j := range jobs {
		jobID, err := nextJobID(ctx, rdb, queueName)
		if err != nil {
			return fmt.Errorf("get next job id: %w", err)
		}

		dataBytes, err := json.Marshal(j.Data)
		if err != nil {
			return fmt.Errorf("marshal job data: %w", err)
		}

		optsBytes, err := json.Marshal(j.Opts)
		if err != nil {
			return fmt.Errorf("marshal job opts: %w", err)
		}

		now := time.Now().UnixMilli()
		key := jobKey(queueName, jobID)

		// Store the job hash
		pipe := rdb.Pipeline()
		pipe.HSet(ctx, key,
			"name", j.Name,
			"data", string(dataBytes),
			"opts", string(optsBytes),
			"timestamp", now,
			"attemptsMade", 0,
			"attemptsStarted", 0,
			"stalledCounter", 0,
		)

		if j.Opts.Priority > 0 {
			// Priority jobs go into the prioritized sorted set.
			// BullMQ score = priority * 0x100000000 + counter (counter increments per priority)
			// For simplicity we use: score = priority * 1e12 + now which preserves ordering.
			score := float64(j.Opts.Priority)*1e12 + float64(now)
			pipe.ZAdd(ctx, prioritizedKey(queueName), redis.Z{
				Score:  score,
				Member: jobID,
			})
		} else {
			pipe.LPush(ctx, waitKey(queueName), jobID)
		}

		// Publish event for BullMQ dashboard/metrics compatibility
		eventPayload, _ := json.Marshal(map[string]interface{}{
			"jobId": jobID,
			"prev":  "waiting",
		})
		pipe.XAdd(ctx, &redis.XAddArgs{
			Stream: eventsKey(queueName),
			Values: map[string]interface{}{
				"event": "waiting",
				"data":  string(eventPayload),
			},
			MaxLen: 10000,
		})

		if _, err := pipe.Exec(ctx); err != nil {
			return fmt.Errorf("add job %s: %w", jobID, err)
		}

		log.Printf("Queued job %s/%s id=%s", queueName, j.Name, jobID)
	}
	return nil
}

// moveToActive implements a simplified version of BullMQ's moveToActive Lua script.
// It atomically moves the next job from wait (or prioritized) → active.
// Returns the job ID and whether a job was found.
//
// The Lua script below is compatible with BullMQ v5 in that jobs added by the
// TS BullMQ library can be consumed here and vice-versa. It is intentionally
// simplified – it does not handle stalled job detection or rate limiting, which
// are handled by the BullMQ scheduler in the TS layer if both run simultaneously.
var moveToActiveScript = redis.NewScript(`
local waitKey        = KEYS[1]
local prioritizedKey = KEYS[2]
local activeKey      = KEYS[3]
local jobKeyPrefix   = ARGV[1]  -- e.g. "bull:omnivore-content-fetch-queue:"

-- Try prioritized first (lowest score = highest priority)
local jobId = redis.call("ZPOPMIN", prioritizedKey, 1)
if #jobId > 0 then
  jobId = jobId[1]
else
  -- Fall back to regular wait list (RPOP = FIFO from the end, matching BullMQ)
  jobId = redis.call("RPOP", waitKey)
end

if jobId == false or jobId == nil then
  return nil
end

-- Move to active
redis.call("LPUSH", activeKey, jobId)

return jobId
`)

// PopJob atomically moves the next available job to the active list and returns it.
// Returns nil job if no job is available (non-blocking).
func PopJob(ctx context.Context, rdb *redis.Client, queueName string) (*RawJob, error) {
	keys := []string{
		waitKey(queueName),
		prioritizedKey(queueName),
		activeKey(queueName),
	}
	prefix := queueKey(queueName) + ":"

	result, err := moveToActiveScript.Run(ctx, rdb, keys, prefix).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("moveToActive: %w", err)
	}

	jobID, ok := result.(string)
	if !ok || jobID == "" {
		return nil, nil
	}

	return getJob(ctx, rdb, queueName, jobID)
}

func getJob(ctx context.Context, rdb *redis.Client, queueName, jobID string) (*RawJob, error) {
	fields, err := rdb.HGetAll(ctx, jobKey(queueName, jobID)).Result()
	if err != nil {
		return nil, fmt.Errorf("hgetall job %s: %w", jobID, err)
	}
	if len(fields) == 0 {
		return nil, fmt.Errorf("job %s not found", jobID)
	}

	var opts JobOpts
	if o := fields["opts"]; o != "" {
		_ = json.Unmarshal([]byte(o), &opts)
	}

	var attempts int
	if a := fields["attemptsMade"]; a != "" {
		attempts, _ = strconv.Atoi(a)
	}

	return &RawJob{
		ID:           jobID,
		Name:         fields["name"],
		Data:         json.RawMessage(fields["data"]),
		Opts:         opts,
		AttemptsMade: attempts,
	}, nil
}

// CompleteJob moves a job from active to completed.
func CompleteJob(ctx context.Context, rdb *redis.Client, queueName, jobID string) error {
	now := time.Now().UnixMilli()
	pipe := rdb.Pipeline()
	pipe.LRem(ctx, activeKey(queueName), 0, jobID)
	pipe.ZAdd(ctx, completedKey(queueName), redis.Z{Score: float64(now), Member: jobID})
	pipe.HSet(ctx, jobKey(queueName, jobID), "finishedOn", now)
	// Schedule cleanup (approximate removeOnComplete age)
	pipe.Expire(ctx, jobKey(queueName, jobID), completeAge*time.Second)
	_, err := pipe.Exec(ctx)
	return err
}

// FailJob moves a job from active to failed (or re-queues it for retry).
func FailJob(ctx context.Context, rdb *redis.Client, queueName, jobID string, reason string, opts JobOpts) error {
	now := time.Now().UnixMilli()

	// Increment attemptsMade
	newAttempts, err := rdb.HIncrBy(ctx, jobKey(queueName, jobID), "attemptsMade", 1).Result()
	if err != nil {
		return err
	}

	if int(newAttempts) < opts.Attempts {
		// Retry: calculate exponential backoff delay
		delay := exponentialDelay(opts.Backoff.Delay, int(newAttempts)-1)
		retryAt := now + int64(delay)

		pipe := rdb.Pipeline()
		pipe.LRem(ctx, activeKey(queueName), 0, jobID)
		pipe.ZAdd(ctx, fmt.Sprintf("%s:delayed", queueKey(queueName)), redis.Z{
			Score:  float64(retryAt),
			Member: jobID,
		})
		pipe.HSet(ctx, jobKey(queueName, jobID), "failedReason", reason)
		_, err = pipe.Exec(ctx)
		return err
	}

	// Max attempts reached → move to failed
	pipe := rdb.Pipeline()
	pipe.LRem(ctx, activeKey(queueName), 0, jobID)
	pipe.ZAdd(ctx, failedKey(queueName), redis.Z{Score: float64(now), Member: jobID})
	pipe.HSet(ctx, jobKey(queueName, jobID), "failedReason", reason, "finishedOn", now)
	pipe.Expire(ctx, jobKey(queueName, jobID), failAge*time.Second)
	_, err = pipe.Exec(ctx)
	return err
}

// exponentialDelay returns the next retry delay in milliseconds (matches BullMQ's exponential).
func exponentialDelay(baseDelay, attempt int) int {
	d := baseDelay
	for i := 0; i < attempt; i++ {
		d *= 2
	}
	return d
}

// GetQueueCounts returns job counts for the metrics endpoint.
func GetQueueCounts(ctx context.Context, rdb *redis.Client, queueName string) (map[string]int64, error) {
	pipe := rdb.Pipeline()
	activeCmd := pipe.LLen(ctx, activeKey(queueName))
	failedCmd := pipe.ZCard(ctx, failedKey(queueName))
	completedCmd := pipe.ZCard(ctx, completedKey(queueName))
	prioritizedCmd := pipe.ZCard(ctx, prioritizedKey(queueName))
	waitCmd := pipe.LLen(ctx, waitKey(queueName))

	if _, err := pipe.Exec(ctx); err != nil && err != redis.Nil {
		return nil, err
	}

	return map[string]int64{
		"active":      activeCmd.Val(),
		"failed":      failedCmd.Val(),
		"completed":   completedCmd.Val(),
		"prioritized": prioritizedCmd.Val() + waitCmd.Val(),
	}, nil
}

// OldestPrioritizedJobAge returns the age in seconds of the oldest prioritized job, or 0.
func OldestPrioritizedJobAge(ctx context.Context, rdb *redis.Client, queueName string) (float64, error) {
	// Check both prioritized zset and wait list
	results, err := rdb.ZRangeWithScores(ctx, prioritizedKey(queueName), 0, 0).Result()
	if err != nil {
		return 0, err
	}

	if len(results) > 0 {
		// score encodes priority+counter, so we need the job's timestamp field
		jobID := results[0].Member.(string)
		ts, err := rdb.HGet(ctx, jobKey(queueName, jobID), "timestamp").Result()
		if err == nil {
			if tsMs, err := strconv.ParseInt(ts, 10, 64); err == nil {
				return float64(time.Now().UnixMilli()-tsMs) / 1000.0, nil
			}
		}
	}

	// Fall back to wait list
	waitIDs, err := rdb.LRange(ctx, waitKey(queueName), -1, -1).Result() // oldest = tail
	if err != nil || len(waitIDs) == 0 {
		return 0, nil
	}
	ts, err := rdb.HGet(ctx, jobKey(queueName, waitIDs[0]), "timestamp").Result()
	if err != nil {
		return 0, nil
	}
	tsMs, err := strconv.ParseInt(ts, 10, 64)
	if err != nil {
		return 0, nil
	}
	return float64(time.Now().UnixMilli()-tsMs) / 1000.0, nil
}

// EnsureQueueMeta ensures the queue metadata key exists (BullMQ creates this on queue init).
func EnsureQueueMeta(ctx context.Context, rdb *redis.Client, queueName string) error {
	return rdb.HSetNX(ctx, metaKey(queueName), "version", "5").Err()
}
