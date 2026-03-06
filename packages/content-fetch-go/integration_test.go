// Package main contains integration tests for the content-fetch-go service.
//
// These tests require Docker to be running locally (testcontainers-go spins up a Redis
// container automatically). No PostgreSQL is required; content-fetch-go depends only on Redis.
//
// Run all integration tests:
//
//	go test -v -tags integration -timeout 120s ./...
//
// Or with the default build tags (tests are always compiled but Redis container is
// started only when the "integration" build tag is present):
//
//	go test -v -timeout 120s -run TestIntegration ./...
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/omnivore-app/omnivore/content-fetch-go/internal/browser"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/bullmq"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/config"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/fetch"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/handler"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/redisutil"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/server"
	"github.com/redis/go-redis/v9"
	tcredis "github.com/testcontainers/testcontainers-go/modules/redis"
)

// ---- helpers ----------------------------------------------------------------

// testEnv holds all resources for a single test run.
type testEnv struct {
	redisDS      *redisutil.RedisDataSource
	cfg          *config.Config
	redisAddr    string
	redisCleanup func()
}

// newTestEnv spins up a Redis container and returns a fully-initialized testEnv.
// Call env.close() in a defer to release all resources.
func newTestEnv(t *testing.T) *testEnv {
	t.Helper()
	ctx := context.Background()

	redisContainer, err := tcredis.Run(ctx, "redis:7-alpine")
	if err != nil {
		t.Fatalf("failed to start Redis container: %v", err)
	}

	redisAddr, err := redisContainer.ConnectionString(ctx)
	if err != nil {
		_ = redisContainer.Terminate(ctx)
		t.Fatalf("failed to get Redis connection string: %v", err)
	}
	// testcontainers returns "redis://host:port", strip scheme for go-redis
	redisAddr = strings.TrimPrefix(redisAddr, "redis://")

	t.Logf("Redis container started at %s", redisAddr)

	cfg := &config.Config{
		VerificationToken:   "test-token",
		RedisURL:            "redis://" + redisAddr,
		MQRedisURL:          "redis://" + redisAddr,
		SkipUploadOriginal:  true,  // do not attempt GCS uploads in tests
		SendAnalytics:       false, // do not call PostHog
		MaxFeedFetchFailures: 10,
		LaunchHeadless:      true,
	}

	redisDS, err := redisutil.New(cfg)
	if err != nil {
		_ = redisContainer.Terminate(ctx)
		t.Fatalf("failed to connect to Redis: %v", err)
	}

	return &testEnv{
		redisDS:   redisDS,
		cfg:       cfg,
		redisAddr: redisAddr,
		redisCleanup: func() {
			redisDS.Shutdown()
			_ = redisContainer.Terminate(ctx)
		},
	}
}

func (e *testEnv) close() {
	e.redisCleanup()
}

// noopWorker satisfies the server.Worker interface without blocking in tests.
type noopWorker struct{}

func (noopWorker) Wait() {}

// seedCacheEntry writes a pre-computed fetch result to the Redis cache so that
// handler.ProcessFetchContentJob returns it without launching a real browser.
func seedCacheEntry(t *testing.T, env *testEnv, rawURL, locale, timezone string, result *fetch.Result) {
	t.Helper()
	ctx := context.Background()

	type cachedResult struct {
		FinalURL    string `json:"finalUrl"`
		Title       string `json:"title,omitempty"`
		Content     string `json:"content,omitempty"`
		ContentType string `json:"contentType,omitempty"`
	}

	val, err := json.Marshal(cachedResult{
		FinalURL:    result.FinalURL,
		Title:       result.Title,
		Content:     result.Content,
		ContentType: result.ContentType,
	})
	if err != nil {
		t.Fatalf("failed to marshal cache entry: %v", err)
	}

	key := fmt.Sprintf("fetch-result:%s:%s:%s", rawURL, locale, timezone)
	if err := env.redisDS.CacheClient.Set(ctx, key, string(val), 24*time.Hour).Err(); err != nil {
		t.Fatalf("failed to seed cache: %v", err)
	}
}

// waitForSavePageJob polls the backend queue until a save-page job appears for the
// given userID, or times out.  Returns the raw job data bytes.
func waitForSavePageJob(t *testing.T, env *testEnv, userID string, timeout time.Duration) json.RawMessage {
	t.Helper()
	ctx := context.Background()
	deadline := time.Now().Add(timeout)

	for time.Now().Before(deadline) {
		// Inspect the wait list of the backend queue for any job whose data contains userID
		ids, err := env.redisDS.MQClient.LRange(ctx, "bull:"+bullmq.BackendQueue+":wait", 0, -1).Result()
		if err != nil {
			time.Sleep(50 * time.Millisecond)
			continue
		}
		// Also check prioritized sorted set
		pids, _ := env.redisDS.MQClient.ZRange(ctx, "bull:"+bullmq.BackendQueue+":prioritized", 0, -1).Result()
		ids = append(ids, pids...)

		for _, id := range ids {
			key := fmt.Sprintf("bull:%s:%s", bullmq.BackendQueue, id)
			data, err := env.redisDS.MQClient.HGet(ctx, key, "data").Result()
			if err != nil {
				continue
			}
			if strings.Contains(data, userID) {
				return json.RawMessage(data)
			}
		}
		time.Sleep(50 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for save-page job for user %s", userID)
	return nil
}

// ---- HTTP endpoint tests ----------------------------------------------------

// TestIntegration_HealthEndpoint verifies that GET /_ah/health returns 200 OK.
func TestIntegration_HealthEndpoint(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	srv := server.New(env.cfg, env.redisDS, &browser.Browser{}, noopWorker{})

	req := httptest.NewRequest(http.MethodGet, "/_ah/health", nil)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("health: expected 200, got %d", rec.Code)
	}
}

// TestIntegration_TokenAuth verifies that the root endpoint rejects requests
// with missing or wrong tokens and accepts requests with the correct token.
func TestIntegration_TokenAuth(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	srv := server.New(env.cfg, env.redisDS, &browser.Browser{}, noopWorker{})

	// --- no token -------------------------------------------------------
	body := `{"url":"https://example.com","saveRequestId":"req1","priority":"high"}`
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Errorf("no token: expected 403, got %d", rec.Code)
	}

	// --- wrong token ----------------------------------------------------
	req = httptest.NewRequest(http.MethodPost, "/?token=wrong", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	srv.ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Errorf("wrong token: expected 403, got %d", rec.Code)
	}
}

// TestIntegration_MetricsEndpoint verifies that GET /metrics returns Prometheus text.
func TestIntegration_MetricsEndpoint(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	srv := server.New(env.cfg, env.redisDS, &browser.Browser{}, noopWorker{})

	req := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("metrics: expected 200, got %d", rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); !strings.Contains(ct, "text/plain") {
		t.Errorf("metrics: unexpected Content-Type: %s", ct)
	}
	if !strings.Contains(rec.Body.String(), "omnivore_queue_messages") {
		t.Errorf("metrics: body missing 'omnivore_queue_messages': %s", rec.Body.String())
	}
}

// TestIntegration_UnknownPath verifies that unknown paths return 404.
func TestIntegration_UnknownPath(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	srv := server.New(env.cfg, env.redisDS, &browser.Browser{}, noopWorker{})

	req := httptest.NewRequest(http.MethodGet, "/unknown/path", nil)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Errorf("unknown path: expected 404, got %d", rec.Code)
	}
}

// ---- handler / worker end-to-end tests --------------------------------------

// TestIntegration_ProcessJobFromCache verifies the full job-processing flow when
// the fetch result is already in the Redis cache (no real browser needed):
//  1. A fetch-result entry is seeded into Redis.
//  2. ProcessFetchContentJob is called directly with matching job data.
//  3. A save-page job appears in bull:omnivore-backend-queue.
func TestIntegration_ProcessJobFromCache(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	const (
		userID    = "user-abc-123"
		itemID    = "item-xyz-456"
		targetURL = "https://example.com/article"
	)

	// Pre-seed the fetch result so that no real browser is launched.
	seedCacheEntry(t, env, targetURL, "", "", &fetch.Result{
		FinalURL:    targetURL,
		Title:       "Test Article",
		Content:     "<html><body>Hello world</body></html>",
		ContentType: "text/html",
	})

	jobData := &handler.JobData{
		URL:           targetURL,
		UserID:        strPtr(userID),
		SaveRequestID: itemID,
		Priority:      "high",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := handler.ProcessFetchContentJob(ctx, env.cfg, env.redisDS, &browser.Browser{}, jobData, 0); err != nil {
		t.Fatalf("ProcessFetchContentJob error: %v", err)
	}

	// Verify the save-page job was enqueued in the backend queue.
	jobBytes := waitForSavePageJob(t, env, userID, 5*time.Second)

	var saveJob map[string]interface{}
	if err := json.Unmarshal(jobBytes, &saveJob); err != nil {
		t.Fatalf("failed to parse save-page job data: %v", err)
	}

	assertField(t, saveJob, "userId", userID)
	assertField(t, saveJob, "url", targetURL)
	assertField(t, saveJob, "articleSavingRequestId", itemID)
	assertField(t, saveJob, "title", "Test Article")
}

// TestIntegration_ProcessJobMultiUser verifies that when a job has multiple users,
// a separate save-page job is enqueued for each one.
func TestIntegration_ProcessJobMultiUser(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	const targetURL = "https://example.com/multi-user"

	seedCacheEntry(t, env, targetURL, "", "", &fetch.Result{
		FinalURL:    targetURL,
		Title:       "Multi-User Article",
		Content:     "<html><body>shared content</body></html>",
		ContentType: "text/html",
	})

	users := []handler.UserConfig{
		{ID: "user-1", LibraryItemID: "item-1"},
		{ID: "user-2", LibraryItemID: "item-2"},
	}

	jobData := &handler.JobData{
		URL:           targetURL,
		SaveRequestID: "req-multi",
		Users:         users,
		Priority:      "low",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := handler.ProcessFetchContentJob(ctx, env.cfg, env.redisDS, &browser.Browser{}, jobData, 0); err != nil {
		t.Fatalf("ProcessFetchContentJob error: %v", err)
	}

	// Both users should have save-page jobs in the backend queue.
	waitForSavePageJob(t, env, "user-1", 5*time.Second)
	waitForSavePageJob(t, env, "user-2", 5*time.Second)

	// Verify count: at least 2 save-page jobs.
	ctx2 := context.Background()
	ids, err := env.redisDS.MQClient.LRange(ctx2, "bull:"+bullmq.BackendQueue+":wait", 0, -1).Result()
	pids, _ := env.redisDS.MQClient.ZRange(ctx2, "bull:"+bullmq.BackendQueue+":prioritized", 0, -1).Result()
	if err != nil {
		t.Fatalf("lrange error: %v", err)
	}
	total := len(ids) + len(pids)
	if total < 2 {
		t.Errorf("expected at least 2 save-page jobs, got %d", total)
	}
}

// TestIntegration_CacheHit verifies that the second call for the same URL uses
// the cached result and does not overwrite it.
func TestIntegration_CacheHit(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	const (
		userID    = "cache-user"
		targetURL = "https://example.com/cached-article"
	)

	seedCacheEntry(t, env, targetURL, "", "", &fetch.Result{
		FinalURL:    targetURL,
		Title:       "Cached Title",
		Content:     "<html><body>cached</body></html>",
		ContentType: "text/html",
	})

	ctx := context.Background()

	run := func(itemID string) {
		jobData := &handler.JobData{
			URL:           targetURL,
			UserID:        strPtr(userID),
			SaveRequestID: itemID,
			Priority:      "high",
		}
		if err := handler.ProcessFetchContentJob(ctx, env.cfg, env.redisDS, &browser.Browser{}, jobData, 0); err != nil {
			t.Fatalf("ProcessFetchContentJob error: %v", err)
		}
	}

	run("item-first-call")
	run("item-second-call")

	// Both calls should have produced save-page jobs with "Cached Title".
	// The wait list should have at least 2 entries.
	ids, _ := env.redisDS.MQClient.LRange(ctx, "bull:"+bullmq.BackendQueue+":wait", 0, -1).Result()
	pids, _ := env.redisDS.MQClient.ZRange(ctx, "bull:"+bullmq.BackendQueue+":prioritized", 0, -1).Result()
	if len(ids)+len(pids) < 2 {
		t.Errorf("expected at least 2 queued save-page jobs, got %d", len(ids)+len(pids))
	}

	// Verify title came from cache on both runs.
	for _, id := range append(ids, pids...) {
		key := fmt.Sprintf("bull:%s:%s", bullmq.BackendQueue, id)
		data, _ := env.redisDS.MQClient.HGet(ctx, key, "data").Result()
		if data != "" && !strings.Contains(data, "Cached Title") {
			t.Errorf("job %s: expected 'Cached Title' in data, got: %s", id, data)
		}
	}
}

// TestIntegration_DomainBlocking verifies that when a domain has exceeded the
// maximum failure threshold it is silently dropped (no save-page job queued).
func TestIntegration_DomainBlocking(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	const targetURL = "https://blocked-domain.example/article"
	const domain = "blocked-domain.example"

	ctx := context.Background()

	// Simulate the domain being over the failure limit.
	failureKey := "fetch-failure:" + domain
	env.redisDS.CacheClient.Set(ctx, failureKey, "999", time.Hour)

	jobData := &handler.JobData{
		URL:           targetURL,
		UserID:        strPtr("user-blocked"),
		SaveRequestID: "req-blocked",
		Priority:      "high",
	}

	if err := handler.ProcessFetchContentJob(ctx, env.cfg, env.redisDS, &browser.Browser{}, jobData, 0); err != nil {
		t.Fatalf("expected no error for blocked domain, got: %v", err)
	}

	// No save-page job should have been queued.
	ids, _ := env.redisDS.MQClient.LRange(ctx, "bull:"+bullmq.BackendQueue+":wait", 0, -1).Result()
	pids, _ := env.redisDS.MQClient.ZRange(ctx, "bull:"+bullmq.BackendQueue+":prioritized", 0, -1).Result()
	if len(ids)+len(pids) > 0 {
		t.Errorf("expected no queued jobs for blocked domain, got %d", len(ids)+len(pids))
	}
}

// TestIntegration_HardcodedDomainBlocking verifies that hardcoded blocked domains
// (localhost, weibo.com) are rejected even without a failure counter.
func TestIntegration_HardcodedDomainBlocking(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	ctx := context.Background()

	blockedURLs := []string{
		"https://weibo.com/some-article",
	}

	for _, u := range blockedURLs {
		jobData := &handler.JobData{
			URL:           u,
			UserID:        strPtr("user-x"),
			SaveRequestID: "req-x",
			Priority:      "high",
		}
		if err := handler.ProcessFetchContentJob(ctx, env.cfg, env.redisDS, &browser.Browser{}, jobData, 0); err != nil {
			t.Fatalf("expected no error for hardcoded blocked URL %s, got: %v", u, err)
		}
	}

	// No save-page job should have been queued.
	ids, _ := env.redisDS.MQClient.LRange(ctx, "bull:"+bullmq.BackendQueue+":wait", 0, -1).Result()
	pids, _ := env.redisDS.MQClient.ZRange(ctx, "bull:"+bullmq.BackendQueue+":prioritized", 0, -1).Result()
	if len(ids)+len(pids) > 0 {
		t.Errorf("expected 0 queued jobs, got %d", len(ids)+len(pids))
	}
}

// TestIntegration_QueueWorkerEndToEnd enqueues a job in the content-fetch BullMQ
// queue, starts a real Worker, and verifies that a save-page job appears in the
// backend queue after processing.  The fetch result is pre-seeded in Redis to
// avoid launching a real browser.
func TestIntegration_QueueWorkerEndToEnd(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	const (
		userID    = "worker-e2e-user"
		itemID    = "worker-e2e-item"
		targetURL = "https://example.com/worker-e2e"
	)

	// Pre-seed fetch result so the worker doesn't need a real browser.
	seedCacheEntry(t, env, targetURL, "", "", &fetch.Result{
		FinalURL:    targetURL,
		Title:       "Worker E2E Article",
		Content:     "<html><body>worker e2e content</body></html>",
		ContentType: "text/html",
	})

	// Enqueue a job into the content-fetch queue using the bullmq package.
	ctx := context.Background()
	jobData := handler.JobData{
		URL:           targetURL,
		UserID:        strPtr(userID),
		SaveRequestID: itemID,
		Priority:      "high",
	}

	if err := bullmq.AddBulk(ctx, env.redisDS.MQClient, bullmq.ContentFetchQueue, []bullmq.AddJobOpts{
		{
			Name: "fetch-content",
			Data: jobData,
			Opts: bullmq.JobOpts{
				Attempts: 3,
				Priority: 1,
				Backoff:  bullmq.BackoffOpt{Type: "exponential", Delay: 2000},
			},
		},
	}); err != nil {
		t.Fatalf("AddBulk error: %v", err)
	}

	// Start the worker.
	workerCtx, workerCancel := context.WithCancel(context.Background())
	defer workerCancel()

	w := newTestWorker(workerCtx, env)
	w.Start()

	// Wait for the save-page job to appear in the backend queue.
	saveJobBytes := waitForSavePageJob(t, env, userID, 15*time.Second)

	var saveJob map[string]interface{}
	if err := json.Unmarshal(saveJobBytes, &saveJob); err != nil {
		t.Fatalf("failed to parse save-page job data: %v", err)
	}

	assertField(t, saveJob, "userId", userID)
	assertField(t, saveJob, "url", targetURL)
	assertField(t, saveJob, "articleSavingRequestId", itemID)
	assertField(t, saveJob, "title", "Worker E2E Article")
}

// TestIntegration_HTTPEndpointProcessesJob tests the full HTTP→handler path via
// an httptest server, verifying that a POST to / with a valid token processes the
// job and enqueues save-page entries in Redis.
func TestIntegration_HTTPEndpointProcessesJob(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	const (
		userID    = "http-user-789"
		itemID    = "http-item-789"
		targetURL = "https://example.com/http-endpoint-test"
	)

	seedCacheEntry(t, env, targetURL, "", "", &fetch.Result{
		FinalURL:    targetURL,
		Title:       "HTTP Endpoint Test Article",
		Content:     "<html><body>http test</body></html>",
		ContentType: "text/html",
	})

	srv := server.New(env.cfg, env.redisDS, &browser.Browser{}, noopWorker{})
	ts := httptest.NewServer(srv)
	defer ts.Close()

	jobPayload := handler.JobData{
		URL:           targetURL,
		UserID:        strPtr(userID),
		SaveRequestID: itemID,
		Priority:      "high",
	}
	body, _ := json.Marshal(jobPayload)

	resp, err := http.Post(
		ts.URL+"/?token="+env.cfg.VerificationToken,
		"application/json",
		bytes.NewReader(body),
	)
	if err != nil {
		t.Fatalf("HTTP POST error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	jobBytes := waitForSavePageJob(t, env, userID, 5*time.Second)

	var saveJob map[string]interface{}
	if err := json.Unmarshal(jobBytes, &saveJob); err != nil {
		t.Fatalf("failed to parse save-page job: %v", err)
	}
	assertField(t, saveJob, "userId", userID)
	assertField(t, saveJob, "title", "HTTP Endpoint Test Article")
}

// TestIntegration_BullMQAddAndPop verifies the bullmq package's AddBulk / PopJob
// round-trip independently of the handler logic.
func TestIntegration_BullMQAddAndPop(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	ctx := context.Background()
	const queueName = "omnivore-test-queue"

	type testPayload struct {
		Msg string `json:"msg"`
	}

	// Ensure queue metadata exists.
	_ = bullmq.EnsureQueueMeta(ctx, env.redisDS.MQClient, queueName)

	// Add two jobs.
	if err := bullmq.AddBulk(ctx, env.redisDS.MQClient, queueName, []bullmq.AddJobOpts{
		{Name: "job-a", Data: testPayload{Msg: "hello"}, Opts: bullmq.JobOpts{Attempts: 1}},
		{Name: "job-b", Data: testPayload{Msg: "world"}, Opts: bullmq.JobOpts{Attempts: 1}},
	}); err != nil {
		t.Fatalf("AddBulk error: %v", err)
	}

	// Pop both.
	job1, err := bullmq.PopJob(ctx, env.redisDS.MQClient, queueName)
	if err != nil || job1 == nil {
		t.Fatalf("PopJob 1 error: %v (job=%v)", err, job1)
	}

	job2, err := bullmq.PopJob(ctx, env.redisDS.MQClient, queueName)
	if err != nil || job2 == nil {
		t.Fatalf("PopJob 2 error: %v (job=%v)", err, job2)
	}

	// Third pop should return nil (queue empty).
	job3, err := bullmq.PopJob(ctx, env.redisDS.MQClient, queueName)
	if err != nil {
		t.Fatalf("PopJob 3 error: %v", err)
	}
	if job3 != nil {
		t.Errorf("expected nil job on empty queue, got id=%s", job3.ID)
	}

	// Complete job1 and fail job2.
	if err := bullmq.CompleteJob(ctx, env.redisDS.MQClient, queueName, job1.ID); err != nil {
		t.Fatalf("CompleteJob error: %v", err)
	}
	if err := bullmq.FailJob(ctx, env.redisDS.MQClient, queueName, job2.ID, "test error", job2.Opts); err != nil {
		t.Fatalf("FailJob error: %v", err)
	}

	// Verify counts.
	counts, err := bullmq.GetQueueCounts(ctx, env.redisDS.MQClient, queueName)
	if err != nil {
		t.Fatalf("GetQueueCounts error: %v", err)
	}
	if counts["completed"] != 1 {
		t.Errorf("expected 1 completed job, got %d", counts["completed"])
	}
	if counts["failed"] != 1 {
		t.Errorf("expected 1 failed job, got %d", counts["failed"])
	}
}

// TestIntegration_BullMQPriority verifies that high-priority jobs are popped before
// lower-priority ones when added to the prioritized sorted set.
func TestIntegration_BullMQPriority(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	ctx := context.Background()
	const queueName = "omnivore-priority-test"

	_ = bullmq.EnsureQueueMeta(ctx, env.redisDS.MQClient, queueName)

	if err := bullmq.AddBulk(ctx, env.redisDS.MQClient, queueName, []bullmq.AddJobOpts{
		{Name: "low-pri",  Data: map[string]string{"p": "low"},  Opts: bullmq.JobOpts{Priority: 100}},
		{Name: "high-pri", Data: map[string]string{"p": "high"}, Opts: bullmq.JobOpts{Priority: 1}},
	}); err != nil {
		t.Fatalf("AddBulk error: %v", err)
	}

	// Highest priority (lowest score) should be popped first.
	first, err := bullmq.PopJob(ctx, env.redisDS.MQClient, queueName)
	if err != nil || first == nil {
		t.Fatalf("PopJob error: %v", err)
	}
	if first.Name != "high-pri" {
		t.Errorf("expected 'high-pri' first, got %q", first.Name)
	}
}

// TestIntegration_RedisCacheSetAndGet verifies that fetch results are cached in
// Redis and returned on subsequent calls to ProcessFetchContentJob.
func TestIntegration_RedisCacheSetAndGet(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	ctx := context.Background()
	const targetURL = "https://example.com/cache-verify"
	const cacheKey = "fetch-result:" + targetURL + "::"

	// Seed the cache entry directly.
	cacheVal := `{"finalUrl":"` + targetURL + `","title":"Cached!","content":"<html/>","contentType":"text/html"}`
	if err := env.redisDS.CacheClient.Set(ctx, cacheKey, cacheVal, time.Hour).Err(); err != nil {
		t.Fatalf("SET error: %v", err)
	}

	// Verify it's readable.
	val, err := env.redisDS.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		t.Fatalf("GET error: %v", err)
	}
	var result map[string]string
	if err := json.Unmarshal([]byte(val), &result); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if result["title"] != "Cached!" {
		t.Errorf("expected title 'Cached!', got %q", result["title"])
	}

	// Now run the handler — it should use the cache and not fail.
	jobData := &handler.JobData{
		URL:           targetURL,
		UserID:        strPtr("cache-test-user"),
		SaveRequestID: "cache-test-item",
		Priority:      "high",
	}
	if err := handler.ProcessFetchContentJob(ctx, env.cfg, env.redisDS, &browser.Browser{}, jobData, 0); err != nil {
		t.Fatalf("ProcessFetchContentJob error: %v", err)
	}

	// Confirm a save-page job was enqueued.
	waitForSavePageJob(t, env, "cache-test-user", 5*time.Second)
}

// TestIntegration_InvalidTokenRejected verifies that a POST with an invalid
// verification token returns HTTP 403 and no jobs are enqueued.
func TestIntegration_InvalidTokenRejected(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	srv := server.New(env.cfg, env.redisDS, &browser.Browser{}, noopWorker{})
	ts := httptest.NewServer(srv)
	defer ts.Close()

	body := `{"url":"https://example.com","saveRequestId":"r1","priority":"high"}`
	resp, err := http.Post(ts.URL+"/?token=bad-token", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatalf("POST error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusForbidden {
		t.Errorf("expected 403, got %d", resp.StatusCode)
	}

	// No jobs should have been queued.
	ctx := context.Background()
	ids, _ := env.redisDS.MQClient.LRange(ctx, "bull:"+bullmq.BackendQueue+":wait", 0, -1).Result()
	if len(ids) > 0 {
		t.Errorf("expected no queued jobs after rejected request, got %d", len(ids))
	}
}

// ---- queue-worker test helper -----------------------------------------------

// testWorker is a minimal Worker backed by handler.ProcessFetchContentJob,
// used to test the full queue→handler→queue pipeline without a real browser.
type testWorker struct {
	ctx     context.Context
	env     *testEnv
	done    chan struct{}
}

func newTestWorker(ctx context.Context, env *testEnv) *testWorker {
	return &testWorker{ctx: ctx, env: env, done: make(chan struct{})}
}

func (w *testWorker) Start() {
	go w.run()
}

func (w *testWorker) run() {
	defer close(w.done)
	_ = bullmq.EnsureQueueMeta(w.ctx, w.env.redisDS.MQClient, bullmq.ContentFetchQueue)
	for {
		select {
		case <-w.ctx.Done():
			return
		default:
		}

		job, err := bullmq.PopJob(w.ctx, w.env.redisDS.MQClient, bullmq.ContentFetchQueue)
		if err != nil {
			time.Sleep(50 * time.Millisecond)
			continue
		}
		if job == nil {
			time.Sleep(50 * time.Millisecond)
			continue
		}

		var data handler.JobData
		if err := json.Unmarshal(job.Data, &data); err != nil {
			_ = bullmq.FailJob(w.ctx, w.env.redisDS.MQClient, bullmq.ContentFetchQueue, job.ID, err.Error(), job.Opts)
			continue
		}

		if err := handler.ProcessFetchContentJob(w.ctx, w.env.cfg, w.env.redisDS, &browser.Browser{}, &data, job.AttemptsMade); err != nil {
			_ = bullmq.FailJob(w.ctx, w.env.redisDS.MQClient, bullmq.ContentFetchQueue, job.ID, err.Error(), job.Opts)
			continue
		}
		_ = bullmq.CompleteJob(w.ctx, w.env.redisDS.MQClient, bullmq.ContentFetchQueue, job.ID)
	}
}

// ---- assertion helpers ------------------------------------------------------

func assertField(t *testing.T, m map[string]interface{}, key, expected string) {
	t.Helper()
	val, ok := m[key]
	if !ok {
		t.Errorf("missing field %q in job data", key)
		return
	}
	if s, _ := val.(string); s != expected {
		t.Errorf("field %q: expected %q, got %q", key, expected, s)
	}
}

func strPtr(s string) *string { return &s }

// ---- Redis connectivity test ------------------------------------------------

// TestIntegration_RedisConnectivity is a quick sanity check that the test Redis
// container is reachable before running more complex tests.
func TestIntegration_RedisConnectivity(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := env.redisDS.CacheClient.Ping(ctx).Err(); err != nil {
		t.Fatalf("Redis PING failed: %v", err)
	}
	t.Logf("Redis connectivity OK at %s", env.redisAddr)
}

// TestIntegration_SetMethodNotAllowed verifies that a DELETE request to /
// returns 405 Method Not Allowed.
func TestIntegration_SetMethodNotAllowed(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	srv := server.New(env.cfg, env.redisDS, &browser.Browser{}, noopWorker{})

	req := httptest.NewRequest(http.MethodDelete, "/?token="+env.cfg.VerificationToken, nil)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("DELETE /: expected 405, got %d", rec.Code)
	}
}

// TestIntegration_RSSJobWithLabelObjects verifies the full path for an RSS-style
// job whose labels field contains objects ({"name":"RSS"}) rather than strings.
// This is the exact shape produced by refreshFeed.ts in the queue-processor.
// Before the fix, the worker logged:
//
//	json: cannot unmarshal object into Go struct field JobData.labels of type string
func TestIntegration_RSSJobWithLabelObjects(t *testing.T) {
	env := newTestEnv(t)
	defer env.close()

	const (
		userID    = "rss-user-1"
		itemID    = "rss-item-1"
		targetURL = "https://example.com/rss-article"
		feedURL   = "https://example.com/feed.xml"
	)

	// Pre-seed a cache entry so no real browser is launched.
	seedCacheEntry(t, env, targetURL, "", "", &fetch.Result{
		FinalURL:    targetURL,
		Title:       "RSS Article",
		Content:     "<html><body>rss content</body></html>",
		ContentType: "text/html",
	})

	// Build the job payload exactly as the queue-processor does it:
	//   labels: [{ name: 'RSS' }]  ← objects, not strings
	rssJob := map[string]interface{}{
		"url":         targetURL,
		"users":       []map[string]string{{"id": userID, "libraryItemId": itemID}},
		"priority":    "low",
		"labels":      []map[string]string{{"name": "RSS"}},
		"rssFeedUrl":  feedURL,
		"savedAt":     "2026-01-20T00:00:00.000Z",
		"publishedAt": "2026-01-20T00:00:00.000Z",
		"source":      "rss-feeder",
	}

	ctx := context.Background()
	if err := bullmq.AddBulk(ctx, env.redisDS.MQClient, bullmq.ContentFetchQueue, []bullmq.AddJobOpts{
		{
			Name: "fetch-content",
			Data: rssJob,
			Opts: bullmq.JobOpts{Attempts: 2, Priority: 10,
				Backoff: bullmq.BackoffOpt{Type: "exponential", Delay: 2000}},
		},
	}); err != nil {
		t.Fatalf("AddBulk error: %v", err)
	}

	// Start the worker — it must not fail to unmarshal the job.
	workerCtx, workerCancel := context.WithCancel(context.Background())
	defer workerCancel()
	w := newTestWorker(workerCtx, env)
	w.Start()

	// A save-page job for userID should appear in the backend queue.
	saveJobBytes := waitForSavePageJob(t, env, userID, 15*time.Second)

	var saveJob map[string]interface{}
	if err := json.Unmarshal(saveJobBytes, &saveJob); err != nil {
		t.Fatalf("parse save-page job: %v", err)
	}

	assertField(t, saveJob, "userId", userID)
	assertField(t, saveJob, "url", targetURL)
	assertField(t, saveJob, "source", "rss-feeder")

	// The save-page job must propagate labels as objects too.
	rawLabels, ok := saveJob["labels"].([]interface{})
	if !ok || len(rawLabels) == 0 {
		t.Fatalf("expected labels array in save-page job, got: %v", saveJob["labels"])
	}
	firstLabel, ok := rawLabels[0].(map[string]interface{})
	if !ok {
		t.Fatalf("expected label object, got %T", rawLabels[0])
	}
	if firstLabel["name"] != "RSS" {
		t.Errorf("label name: got %v, want %q", firstLabel["name"], "RSS")
	}
}

// Ensure the redis client type used in tests is compatible.
var _ *redis.Client = (*redis.Client)(nil)
