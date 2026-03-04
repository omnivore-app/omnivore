// Package server implements the HTTP endpoints matching the original content-fetch Express app.
package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/omnivore-app/omnivore/content-fetch-go/internal/browser"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/config"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/handler"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/bullmq"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/redisutil"
)

// Worker is the minimal interface the server needs from the queue worker.
type Worker interface {
	Wait()
}

type mux struct {
	cfg    *config.Config
	rds    *redisutil.RedisDataSource
	br     *browser.Browser
	worker Worker
	http.ServeMux
}

// New returns an http.Handler with all routes registered.
func New(cfg *config.Config, rds *redisutil.RedisDataSource, br *browser.Browser, w Worker) http.Handler {
	m := &mux{cfg: cfg, rds: rds, br: br, worker: w}
	m.HandleFunc("GET /_ah/health", m.health)
	m.HandleFunc("GET /lifecycle/prestop", m.prestop)
	m.HandleFunc("GET /metrics", m.metrics)
	m.HandleFunc("/", m.root) // GET and POST
	return m
}

// health responds to Google Cloud autoscaler health checks.
func (m *mux) health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

// prestop implements the Kubernetes/Cloud Run prestop lifecycle hook.
// It signals the worker to stop and waits for in-flight jobs to finish.
func (m *mux) prestop(w http.ResponseWriter, r *http.Request) {
	log.Println("Prestop lifecycle hook called.")
	// Worker shutdown is handled by the caller (main) via context cancellation;
	// here we just wait until it's done.
	m.worker.Wait()
	log.Println("Worker drained on prestop")
	w.WriteHeader(http.StatusOK)
}

// metrics returns Prometheus-format queue metrics, matching the original /metrics endpoint.
func (m *mux) metrics(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	counts, err := bullmq.GetQueueCounts(ctx, m.rds.MQClient, bullmq.ContentFetchQueue)
	if err != nil {
		log.Printf("Error getting queue counts: %v", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	age, err := bullmq.OldestPrioritizedJobAge(ctx, m.rds.MQClient, bullmq.ContentFetchQueue)
	if err != nil {
		log.Printf("Error getting oldest job age: %v", err)
	}

	output := ""
	for _, metric := range []string{"active", "failed", "completed", "prioritized"} {
		val, _ := counts[metric]
		output += fmt.Sprintf("# TYPE omnivore_queue_messages_%s gauge\n", metric)
		output += fmt.Sprintf("omnivore_queue_messages_%s{queue=%q} %d\n", metric, bullmq.ContentFetchQueue, val)
	}
	output += "# TYPE omnivore_queue_messages_oldest_job_age_seconds gauge\n"
	output += fmt.Sprintf("omnivore_queue_messages_oldest_job_age_seconds{queue=%q} %s\n",
		bullmq.ContentFetchQueue, strconv.FormatFloat(age, 'f', -1, 64))

	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(output))
}

// root handles the primary job-processing endpoint (GET or POST /?token=...).
func (m *mux) root(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	if r.Method != http.MethodGet && r.Method != http.MethodPost {
		log.Printf("Request method is not GET or POST: %s", r.Method)
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if r.URL.Query().Get("token") != m.cfg.VerificationToken {
		log.Println("Query does not include valid token")
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var data handler.JobData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	attempt := 0
	if v := r.Header.Get("X-CloudTasks-TaskRetryCount"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			attempt = n
		}
	}

	if err := handler.ProcessFetchContentJob(
		context.Background(),
		m.cfg, m.rds, m.br,
		&data, attempt,
	); err != nil {
		log.Printf("Error fetching content: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
