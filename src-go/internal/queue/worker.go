package queue

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/omnivore-app/omnivore/internal/browser"
	"github.com/omnivore-app/omnivore/internal/bullmq"
	"github.com/omnivore-app/omnivore/internal/config"
	"github.com/omnivore-app/omnivore/internal/handler"
	"github.com/omnivore-app/omnivore/internal/redisutil"
)

const (
	workerConcurrency  = 4
	workerPollInterval = 500 * time.Millisecond
)

// Worker processes jobs from the content-fetch BullMQ queue.
type Worker struct {
	ctx context.Context
	config *config.Config
	redisDS *redisutil.RedisDataSource
	browser  *browser.Browser
	wg  sync.WaitGroup
	sem chan struct{}
}

func NewWorker(ctx context.Context, config *config.Config, redisDS *redisutil.RedisDataSource, browser *browser.Browser) *Worker {
	return &Worker{
		ctx: ctx,
		config: config,
		redisDS: redisDS,
		browser:  browser,
		sem: make(chan struct{}, workerConcurrency),
	}
}

func (w *Worker) Start() {
	w.wg.Add(1)
	go w.run()
}

func (w *Worker) Wait() {
	w.wg.Wait()
}

func (w *Worker) run() {
	defer w.wg.Done()

	log.Println("Queue worker started")

	// Ensure queue meta exists
	_ = bullmq.EnsureQueueMeta(w.ctx, w.redisDS.MQClient, bullmq.ContentFetchQueue)

	for {
		select {
		case <-w.ctx.Done():
			log.Println("Queue worker stopping, draining active slots...")
			for i := 0; i < workerConcurrency; i++ {
				w.sem <- struct{}{}
			}
			log.Println("Queue worker stopped")
			return
		default:
		}

		job, err := bullmq.PopJob(w.ctx, w.redisDS.MQClient, bullmq.ContentFetchQueue)
		if err != nil {
			log.Printf("Error popping job: %v", err)
			time.Sleep(workerPollInterval)
			continue
		}
		if job == nil {
			time.Sleep(workerPollInterval)
			continue
		}

		w.sem <- struct{}{}
		w.wg.Add(1)
		go func(j *bullmq.RawJob) {
			defer func() { <-w.sem }()
			defer w.wg.Done()
			w.processJob(j)
		}(job)
	}
}

func (w *Worker) processJob(job *bullmq.RawJob) {
	log.Printf("Processing job id=%s name=%s", job.ID, job.Name)

	var data handler.JobData
	if err := json.Unmarshal(job.Data, &data); err != nil {
		log.Printf("Failed to unmarshal job data id=%s: %v\ndata: %s", job.ID, err, job.Data)
		_ = bullmq.FailJob(w.ctx, w.redisDS.MQClient, bullmq.ContentFetchQueue, job.ID, err.Error(), job.Opts)
		return
	}

	if err := handler.ProcessFetchContentJob(w.ctx, w.config, w.redisDS, w.browser, &data, job.AttemptsMade); err != nil {
		log.Printf("Job id=%s failed: %v", job.ID, err)
		_ = bullmq.FailJob(w.ctx, w.redisDS.MQClient, bullmq.ContentFetchQueue, job.ID, err.Error(), job.Opts)
		return
	}

	_ = bullmq.CompleteJob(w.ctx, w.redisDS.MQClient, bullmq.ContentFetchQueue, job.ID)
	log.Printf("Job id=%s completed", job.ID)
}
