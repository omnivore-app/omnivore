package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/omnivore-app/omnivore/internal/browser"
	"github.com/omnivore-app/omnivore/internal/config"
	"github.com/omnivore-app/omnivore/internal/queue"
	"github.com/omnivore-app/omnivore/internal/redisutil"
	"github.com/omnivore-app/omnivore/internal/server"
	"github.com/spf13/cobra"
)

var contentFetcherCmd = &cobra.Command{
	Use:   "content-fetcher",
	Short: "Start the content-fetch worker and HTTP server",
	Long: `Starts the content-fetch service, which:
  - Polls a BullMQ/Redis queue for fetch-content jobs
  - Renders pages using a headless Chromium browser
  - Uploads original HTML to object storage (GCS, S3, or MinIO)
  - Queues save-page jobs for the backend

Configuration is provided via environment variables. See .env.example for the
full list of supported variables.`,
	RunE: runContentFetcher,
}

func runContentFetcher(cmd *cobra.Command, args []string) error {
	cfg := config.Load()

	if cfg.VerificationToken == "" {
		log.Fatal("VERIFICATION_TOKEN is required")
	}

	redisDS, err := redisutil.New(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	br := browser.New(cfg)

	workerCtx, workerCancel := context.WithCancel(context.Background())
	worker := queue.NewWorker(workerCtx, cfg, redisDS, br)
	worker.Start()

	srv := server.New(cfg, redisDS, br, worker)

	port := cfg.Port
	if port == 0 {
		port = 8080
	}
	addr := ":" + strconv.Itoa(port)

	httpServer := &http.Server{
		Addr:    addr,
		Handler: srv,
	}

	go func() {
		log.Printf("content-fetcher listening on %s", addr)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	log.Printf("Received %s, shutting down...", sig)

	if err := httpServer.Shutdown(context.Background()); err != nil {
		log.Printf("HTTP server shutdown error: %v", err)
	}
	log.Println("HTTP server closed")

	workerCancel()
	worker.Wait()
	log.Println("Worker closed")

	br.Close()
	log.Println("Browser closed")

	redisDS.Shutdown()
	log.Println("Redis connection closed")

	return nil
}
