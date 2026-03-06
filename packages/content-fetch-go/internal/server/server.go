// Package server implements the HTTP endpoints matching the original content-fetch Express app.
package server

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/omnivore-app/omnivore/content-fetch-go/internal/browser"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/bullmq"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/config"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/handler"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/metrics"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/redisutil"
)

// Worker is the minimal interface the server needs from the queue worker.
type Worker interface {
	Wait()
}

type mux struct {
	config  *config.Config
	redisDS *redisutil.RedisDataSource
	browser *browser.Browser
	worker  Worker
	http.ServeMux
}

// New returns an http.Handler with all routes registered.
func New(config *config.Config, redisDS *redisutil.RedisDataSource, browser *browser.Browser, worker Worker) http.Handler {
	m := &mux{config: config, redisDS: redisDS, browser: browser, worker: worker}
	m.HandleFunc("GET /_ah/health", m.health)
	m.HandleFunc("GET /lifecycle/prestop", m.prestop)
	m.Handle("GET /metrics", metrics.Handler(redisDS.MQClient, bullmq.ContentFetchQueue))
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
	m.worker.Wait()
	log.Println("Worker drained on prestop")
	w.WriteHeader(http.StatusOK)
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

	if r.URL.Query().Get("token") != m.config.VerificationToken {
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
		m.config, m.redisDS, m.browser,
		&data, attempt,
	); err != nil {
		log.Printf("Error fetching content: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
