// Package metrics registers and exposes Prometheus gauges for the content-fetch
// queue, matching the metric names produced by the original TypeScript service.
package metrics

import (
	"context"
	"log"
	"net/http"

	"github.com/omnivore-app/omnivore/content-fetch-go/internal/bullmq"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"
)

const queueLabel = "queue"

var (
	activeGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "omnivore_queue_messages_active",
		Help: "Number of active jobs in the queue.",
	}, []string{queueLabel})

	failedGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "omnivore_queue_messages_failed",
		Help: "Number of failed jobs in the queue.",
	}, []string{queueLabel})

	completedGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "omnivore_queue_messages_completed",
		Help: "Number of completed jobs in the queue.",
	}, []string{queueLabel})

	prioritizedGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "omnivore_queue_messages_prioritized",
		Help: "Number of prioritized (waiting) jobs in the queue.",
	}, []string{queueLabel})

	oldestJobAgeGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "omnivore_queue_messages_oldest_job_age_seconds",
		Help: "Age in seconds of the oldest prioritized job in the queue.",
	}, []string{queueLabel})
)

func init() {
	prometheus.MustRegister(
		activeGauge,
		failedGauge,
		completedGauge,
		prioritizedGauge,
		oldestJobAgeGauge,
	)
}

// Handler returns an http.Handler that refreshes queue metrics from Redis on
// every request and then delegates to the standard promhttp handler.
func Handler(rdb *redis.Client, queueName string) http.Handler {
	inner := promhttp.Handler()
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := refresh(r.Context(), rdb, queueName); err != nil {
			log.Printf("Error refreshing queue metrics: %v", err)
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		inner.ServeHTTP(w, r)
	})
}

// refresh pulls the current queue counts from Redis and updates the gauges.
func refresh(ctx context.Context, rdb *redis.Client, queueName string) error {
	counts, err := bullmq.GetQueueCounts(ctx, rdb, queueName)
	if err != nil {
		return err
	}

	labels := prometheus.Labels{queueLabel: queueName}
	activeGauge.With(labels).Set(float64(counts["active"]))
	failedGauge.With(labels).Set(float64(counts["failed"]))
	completedGauge.With(labels).Set(float64(counts["completed"]))
	prioritizedGauge.With(labels).Set(float64(counts["prioritized"]))

	age, err := bullmq.OldestPrioritizedJobAge(ctx, rdb, queueName)
	if err != nil {
		log.Printf("Error getting oldest job age: %v", err)
		age = 0
	}
	oldestJobAgeGauge.With(labels).Set(age)

	return nil
}
