package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/omnivore-app/omnivore/content-fetch-go/internal/browser"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/config"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/queue"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/redisutil"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/server"
)

func main() {
	config := config.Load()

	if config.VerificationToken == "" {
		log.Fatal("VERIFICATION_TOKEN is required")
	}

	redisDS, err := redisutil.New(config)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	browser := browser.New(config)

	workerCtx, workerCancel := context.WithCancel(context.Background())
	worker := queue.NewWorker(workerCtx, config, redisDS, browser)
	worker.Start()

	srv := server.New(config, redisDS, browser, worker)

	port := config.Port
	if port == 0 {
		port = 3002
	}
	addr := ":" + strconv.Itoa(port)

	httpServer := &http.Server{
		Addr:    addr,
		Handler: srv,
	}

	go func() {
		log.Printf("Worker started on %s", addr)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit
	log.Printf("Received %s, shutting down...", sig)

	// Stop accepting new HTTP requests
	if err := httpServer.Shutdown(context.Background()); err != nil {
		log.Printf("HTTP server shutdown error: %v", err)
	}
	log.Println("HTTP server closed")

	// Stop queue worker
	workerCancel()
	worker.Wait()
	log.Println("Worker closed")

	// Close browser
	browser.Close()
	log.Println("Browser closed")

	// Close Redis
	redisDS.Shutdown()
	log.Println("Redis connection closed")
}
