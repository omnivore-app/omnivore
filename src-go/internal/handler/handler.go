// Package handler implements processFetchContentJob — the core job processing logic.
// It mirrors packages/content-fetch/src/request_handler.ts exactly.
package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/omnivore-app/omnivore/internal/analytics"
	"github.com/omnivore-app/omnivore/internal/browser"
	"github.com/omnivore-app/omnivore/internal/bullmq"
	"github.com/omnivore-app/omnivore/internal/config"
	"github.com/omnivore-app/omnivore/internal/fetch"
	"github.com/omnivore-app/omnivore/internal/redisutil"
	"github.com/omnivore-app/omnivore/internal/storage"
	"github.com/redis/go-redis/v9"
)

// LabelInput mirrors the TS CreateLabelInput interface.
// Labels are sent as objects (e.g. {"name":"RSS"}), not plain strings.
type LabelInput struct {
	Name        string  `json:"name"`
	Color       *string `json:"color,omitempty"`
	Description *string `json:"description,omitempty"`
}

// UserConfig mirrors the TS UserConfig interface.
type UserConfig struct {
	ID            string  `json:"id"`
	LibraryItemID string  `json:"libraryItemId"`
	Folder        *string `json:"folder,omitempty"`
}

// JobData mirrors the TS FetchContentJobData interface.
type JobData struct {
	URL           string       `json:"url"`
	UserID        *string      `json:"userId,omitempty"`
	SaveRequestID string       `json:"saveRequestId"`
	State         *string      `json:"state,omitempty"`
	Labels        []LabelInput `json:"labels,omitempty"`
	Source        *string      `json:"source,omitempty"`
	TaskID        *string      `json:"taskId,omitempty"`
	Locale        *string      `json:"locale,omitempty"`
	Timezone      *string      `json:"timezone,omitempty"`
	RSSFeedURL    *string      `json:"rssFeedUrl,omitempty"`
	SavedAt       *string      `json:"savedAt,omitempty"`
	PublishedAt   *string      `json:"publishedAt,omitempty"`
	Folder        *string      `json:"folder,omitempty"`
	Users         []UserConfig `json:"users,omitempty"`
	Priority      string       `json:"priority"` // "high" | "low"
}

// savePageJobData mirrors SavePageJobData from job.ts.
type savePageJobData struct {
	UserID                 string       `json:"userId"`
	URL                    string       `json:"url"`
	FinalURL               string       `json:"finalUrl"`
	ArticleSavingRequestID string       `json:"articleSavingRequestId"`
	State                  *string      `json:"state,omitempty"`
	Labels                 []LabelInput `json:"labels,omitempty"`
	Source                 string       `json:"source"`
	Folder                 *string      `json:"folder,omitempty"`
	RSSFeedURL             *string      `json:"rssFeedUrl,omitempty"`
	SavedAt                *string      `json:"savedAt,omitempty"`
	PublishedAt            *string      `json:"publishedAt,omitempty"`
	TaskID                 *string      `json:"taskId,omitempty"`
	Title                  string       `json:"title,omitempty"`
	ContentType            string       `json:"contentType,omitempty"`
	CacheKey               string       `json:"cacheKey,omitempty"`
}

const maxImportAttempts = 1

// ProcessFetchContentJob is the Go equivalent of processFetchContentJob() from request_handler.ts.
func ProcessFetchContentJob(
	ctx context.Context,
	config *config.Config,
	redisDS *redisutil.RedisDataSource,
	browser *browser.Browser,
	data *JobData,
	attemptsMade int,
) error {
	functionStartTime := time.Now()

	// Build user list (mirrors the TS logic)
	users := make([]UserConfig, 0)
	if data.UserID != nil && *data.UserID != "" {
		folder := data.Folder
		users = append(users, UserConfig{
			ID:            *data.UserID,
			LibraryItemID: data.SaveRequestID,
			Folder:        folder,
		})
	} else {
		users = data.Users
	}

	source := "puppeteer-parse"
	if data.Source != nil && *data.Source != "" {
		source = *data.Source
	}

	locale := ""
	if data.Locale != nil {
		locale = *data.Locale
	}
	timezone := ""
	if data.Timezone != nil {
		timezone = *data.Timezone
	}

	logFields := map[string]interface{}{
		"url":                    data.URL,
		"articleSavingRequestId": data.SaveRequestID,
		"source":                 source,
		"users":                  users,
	}
	log.Printf("Article parsing request %+v", logFields)

	var processErr error
	defer func() {
		totalTime := time.Since(functionStartTime).Milliseconds()
		log.Printf("parse-page result url=%s totalTime=%dms error=%v", data.URL, totalTime, processErr)

		// Analytics
		userIDs := make([]string, len(users))
		for i, u := range users {
			userIDs[i] = u.ID
		}
		result := "success"
		var errMsg string
		if processErr != nil {
			result = "failure"
			errMsg = processErr.Error()
		}
		analyticsClient := analytics.New(config)
		analyticsClient.Capture(userIDs, analytics.Event{
			Result:       result,
			URL:          data.URL,
			Source:       source,
			TotalTime:    totalTime,
			ErrorMessage: errMsg,
		})
		analyticsClient.Close()

		// Import status update on final failure attempt
		lastAttempt := attemptsMade+1 >= maxImportAttempts
		if processErr != nil && data.TaskID != nil && *data.TaskID != "" && lastAttempt {
			log.Println("Sending import status update (failure)")
			if len(users) > 0 {
				sendImportStatusUpdate(ctx, config, users[0].ID, *data.TaskID, false)
			}
		}
	}()

	// Check domain block
	domain, err := extractDomain(data.URL)
	if err != nil {
		processErr = fmt.Errorf("invalid URL: %w", err)
		return processErr
	}

	blocked, err := isDomainBlocked(ctx, redisDS, domain, config.MaxFeedFetchFailures)
	if err != nil {
		log.Printf("Error checking domain block: %v", err)
	}
	if blocked {
		log.Printf("Domain is blocked: %s", domain)
		// Return nil (not an error) — mirroring the TS behaviour of silently dropping
		return nil
	}

	// Try cache
	cacheKey := buildCacheKey(data.URL, locale, timezone)
	fetchResult, err := getCachedResult(ctx, redisDS, cacheKey)
	if err != nil {
		log.Printf("Cache read error: %v", err)
	}

	if fetchResult == nil {
		log.Printf("Fetch result not in cache, fetching now: %s", data.URL)
		fetchResult, err = fetch.FetchContent(ctx, browser, data.URL, locale, timezone)
		if err != nil {
			_ = incrementDomainFailure(ctx, redisDS, domain)
			processErr = fmt.Errorf("fetchContent: %w", err)
			return processErr
		}
		log.Println("Content fetched successfully")

		// Cache result (skip NO_CACHE_URLS)
		if fetchResult.Content != "" && !fetch.NoCacheURLs[data.URL] {
			if err := cacheResult(ctx, redisDS, cacheKey, fetchResult); err != nil {
				log.Printf("Cache write error: %v", err)
			}
		}
	}

	savedDate := time.Now()
	if data.SavedAt != nil && *data.SavedAt != "" {
		if t, err := time.Parse(time.RFC3339, *data.SavedAt); err == nil {
			savedDate = t
		}
	}

	// Upload original content to object storage (GCS, S3, or MinIO).
	if fetchResult.Content != "" && !config.SkipUploadOriginal {
		// Bridge the legacy GCS_UPLOAD_SA_KEY_FILE_PATH setting:
		// gcsblob picks up credentials via GOOGLE_APPLICATION_CREDENTIALS.
		if config.GCSKeyFilePath != "" {
			if err := os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", config.GCSKeyFilePath); err != nil {
				log.Printf("Failed to set GOOGLE_APPLICATION_CREDENTIALS: %v", err)
			}
		}

		storageClient, err := storage.New(ctx, config.BlobURL())
		if err != nil {
			log.Printf("Storage client init error: %v", err)
		} else {
			defer storageClient.Close()
			refs := make([]storage.UserRef, len(users))
			for i, u := range users {
				refs[i] = storage.UserRef{ID: u.ID, LibraryItemID: u.LibraryItemID}
			}
			if err := storageClient.UploadOriginalContent(ctx, refs, fetchResult.Content, savedDate.UnixMilli()); err != nil {
				log.Printf("Storage upload error: %v", err)
			}
		}
	}

	// Build save-page jobs and queue them
	savedAtStr := savedDate.Format(time.RFC3339)
	savePageJobs := make([]bullmq.AddJobOpts, 0, len(users))
	for _, user := range users {
		folder := user.Folder
		jobData := savePageJobData{
			UserID:                 user.ID,
			URL:                    data.URL,
			FinalURL:               fetchResult.FinalURL,
			ArticleSavingRequestID: user.LibraryItemID,
			State:                  data.State,
			Labels:                 data.Labels,
			Source:                 source,
			Folder:                 folder,
			RSSFeedURL:             data.RSSFeedURL,
			SavedAt:                &savedAtStr,
			PublishedAt:            data.PublishedAt,
			TaskID:                 data.TaskID,
			Title:                  fetchResult.Title,
			ContentType:            fetchResult.ContentType,
			CacheKey:               cacheKey,
		}

		isRSS := data.RSSFeedURL != nil && *data.RSSFeedURL != ""
		isImport := data.TaskID != nil && *data.TaskID != ""

		priority := getBullMQPriority(isRSS, isImport, data.Priority)
		attempts := getAttempts(isRSS, isImport)
		backoffDelay := 2000

		savePageJobs = append(savePageJobs, bullmq.AddJobOpts{
			Name: bullmq.SavePageJob,
			Data: jobData,
			Opts: bullmq.JobOpts{
				Attempts: attempts,
				Priority: priority,
				Backoff: bullmq.BackoffOpt{
					Type:  "exponential",
					Delay: backoffDelay,
				},
			},
		})
	}

	if err := bullmq.AddBulk(ctx, redisDS.MQClient, bullmq.BackendQueue, savePageJobs); err != nil {
		processErr = fmt.Errorf("queue save-page jobs: %w", err)
		return processErr
	}

	log.Printf("save-page jobs queued: %d", len(savePageJobs))
	return nil
}

// getBullMQPriority mirrors getPriority() from job.ts.
func getBullMQPriority(isRSS, isImport bool, priority string) int {
	if isImport {
		return 100
	}
	if isRSS {
		if priority == "low" {
			return 10
		}
		return 5
	}
	if priority == "low" {
		return 5
	}
	return 1
}

// getAttempts mirrors getAttempts() from job.ts.
func getAttempts(isRSS, isImport bool) int {
	if isImport {
		return 1
	}
	if isRSS {
		return 2
	}
	return 3
}

// buildCacheKey mirrors cacheKey() from request_handler.ts.
func buildCacheKey(rawURL, locale, timezone string) string {
	return fmt.Sprintf("fetch-result:%s:%s:%s", rawURL, locale, timezone)
}

// cachedFetchResult is the JSON structure stored in Redis.
type cachedFetchResult struct {
	FinalURL    string `json:"finalUrl"`
	Title       string `json:"title,omitempty"`
	Content     string `json:"content,omitempty"`
	ContentType string `json:"contentType,omitempty"`
}

// getCachedResult attempts to get a cached fetch result from Redis.
func getCachedResult(ctx context.Context, redisDS *redisutil.RedisDataSource, key string) (*fetch.Result, error) {
	val, err := redisDS.CacheClient.Get(ctx, key).Result()
	if err == redis.Nil {
		log.Printf("Fetch result not cached: %s", key)
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var cached cachedFetchResult
	if err := json.Unmarshal([]byte(val), &cached); err != nil {
		log.Printf("Invalid cache entry for key %s: %v", key, err)
		return nil, nil
	}

	if cached.FinalURL == "" {
		return nil, nil
	}

	log.Printf("Fetch result is cached: %s", key)
	return &fetch.Result{
		FinalURL:    cached.FinalURL,
		Title:       cached.Title,
		Content:     cached.Content,
		ContentType: cached.ContentType,
	}, nil
}

// cacheResult stores a fetch result in Redis with a 24-hour TTL (NX = only if not exists).
func cacheResult(ctx context.Context, redisDS *redisutil.RedisDataSource, key string, r *fetch.Result) error {
	val, err := json.Marshal(cachedFetchResult{
		FinalURL:    r.FinalURL,
		Title:       r.Title,
		Content:     r.Content,
		ContentType: r.ContentType,
	})
	if err != nil {
		return err
	}
	return redisDS.CacheClient.SetNX(ctx, key, string(val), 24*time.Hour).Err()
}

// failureRedisKey mirrors failureRedisKey() from request_handler.ts.
func failureRedisKey(domain string) string {
	return "fetch-failure:" + domain
}

// isDomainBlocked mirrors isDomainBlocked() from request_handler.ts.
func isDomainBlocked(ctx context.Context, redisDS *redisutil.RedisDataSource, domain string, maxFailures int) (bool, error) {
	blockedDomains := map[string]bool{
		"localhost": true,
		"weibo.com": true,
	}
	if blockedDomains[domain] {
		return true, nil
	}

	key := failureRedisKey(domain)
	val, err := redisDS.CacheClient.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	var count int
	if _, err := fmt.Sscanf(val, "%d", &count); err != nil {
		return false, nil
	}

	if count > maxFailures {
		log.Printf("Domain is blocked (failure count=%d): %s", count, domain)
		return true, nil
	}

	return false, nil
}

// incrementDomainFailure mirrors incrementContentFetchFailure() from request_handler.ts.
func incrementDomainFailure(ctx context.Context, redisDS *redisutil.RedisDataSource, domain string) error {
	key := failureRedisKey(domain)
	if err := redisDS.CacheClient.Incr(ctx, key).Err(); err != nil {
		return err
	}
	return redisDS.CacheClient.Expire(ctx, key, time.Hour).Err()
}

// sendImportStatusUpdate mirrors sendImportStatusUpdate() from request_handler.ts.
func sendImportStatusUpdate(ctx context.Context, config *config.Config, userID, taskID string, isImported bool) {
	if config.JWTSecret == "" || config.ImporterMetricsCollectorURL == "" {
		log.Println("JWT_SECRET or IMPORTER_METRICS_COLLECTOR_URL not set, skipping import status update")
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uid": userID,
	})
	tokenStr, err := token.SignedString([]byte(config.JWTSecret))
	if err != nil {
		log.Printf("Failed to sign JWT: %v", err)
		return
	}

	status := "failed"
	if isImported {
		status = "imported"
	}

	body, _ := json.Marshal(map[string]string{
		"taskId": taskID,
		"status": status,
	})

	reqCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, config.ImporterMetricsCollectorURL, bytes.NewReader(body))
	if err != nil {
		log.Printf("Failed to create import status request: %v", err)
		return
	}
	req.Header.Set("Authorization", tokenStr)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("Failed to send import status update: %v", err)
		return
	}
	defer resp.Body.Close()
	log.Printf("Import status update sent: status=%s code=%d", status, resp.StatusCode)
}

// extractDomain extracts the hostname from a URL.
func extractDomain(rawURL string) (string, error) {
	u, err := url.Parse(rawURL)
	if err != nil {
		return "", err
	}
	return u.Hostname(), nil
}
