// Package gcs handles Google Cloud Storage uploads.
package gcs

import (
	"context"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
)

// Client wraps GCS operations.
type Client struct {
	bucket     string
	gcsClient  *storage.Client
}

// New creates a GCS client. If keyFilePath is empty, Application Default Credentials are used.
func New(ctx context.Context, bucketName, keyFilePath string) (*Client, error) {
	var opts []option.ClientOption
	if keyFilePath != "" {
		opts = append(opts, option.WithCredentialsFile(keyFilePath))
	}

	gcsClient, err := storage.NewClient(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("new GCS client: %w", err)
	}

	return &Client{bucket: bucketName, gcsClient: gcsClient}, nil
}

// UploadContent uploads content string to GCS at filePath (non-public, 5s write timeout).
func (c *Client) UploadContent(ctx context.Context, filePath, content string) error {
	writeCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	wc := c.gcsClient.Bucket(c.bucket).Object(filePath).NewWriter(writeCtx)
	wc.ContentType = "text/html"

	if _, err := io.Copy(wc, strings.NewReader(content)); err != nil {
		return fmt.Errorf("write to GCS %s: %w", filePath, err)
	}
	if err := wc.Close(); err != nil {
		return fmt.Errorf("close GCS writer %s: %w", filePath, err)
	}

	log.Printf("Original content uploaded to %s", filePath)
	return nil
}

// UploadOriginalContent mirrors uploadOriginalContent() from request_handler.ts.
// It uploads content for each user using the pattern content/{userId}/{libraryItemId}.{timestamp}.original
func (c *Client) UploadOriginalContent(ctx context.Context, users []UserRef, content string, savedTimestamp int64) error {
	for _, user := range users {
		filePath := fmt.Sprintf("content/%s/%s.%d.original", user.ID, user.LibraryItemID, savedTimestamp)
		if err := c.UploadContent(ctx, filePath, content); err != nil {
			// Log but don't fail the whole job
			log.Printf("Failed to upload original content for user %s: %v", user.ID, err)
		}
	}
	return nil
}

// UserRef holds the minimal user info needed for uploads.
type UserRef struct {
	ID            string
	LibraryItemID string
}
