// Package storage handles object storage uploads via gocloud.dev/blob.
//
// It supports Google Cloud Storage, AWS S3, and MinIO/S3-compatible stores,
// selected via a single BLOB_STORAGE_URL environment variable:
//
//	gs://my-bucket                           → GCS (Application Default Credentials)
//	s3://my-bucket?region=us-east-1          → AWS S3
//	s3://my-bucket?endpoint=http://minio:9000&use_path_style=true&disable_https=true&region=us-east-1
//	                                          → MinIO
//
// AWS credentials for S3/MinIO are loaded via the standard AWS SDK v2 chain
// (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars, IAM role, ~/.aws/credentials).
package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"gocloud.dev/blob"
	_ "gocloud.dev/blob/gcsblob" // registers gs:// URL opener
	_ "gocloud.dev/blob/s3blob"  // registers s3:// URL opener
)

// Client wraps blob storage operations.
type Client struct {
	bucket *blob.Bucket
}

// UserRef holds the minimal user info needed for uploads.
type UserRef struct {
	ID            string
	LibraryItemID string
}

// New opens a blob.Bucket from a gocloud.dev URL string.
// The URL scheme selects the backend:
//   - gs://bucket-name         → Google Cloud Storage
//   - s3://bucket-name?...     → AWS S3 or any S3-compatible store (MinIO, Ceph, R2…)
//
// For MinIO add: endpoint=http://host:port&use_path_style=true&disable_https=true&region=us-east-1
// The caller must call Close() when done.
func New(ctx context.Context, bucketURL string) (*Client, error) {
	bucket, err := blob.OpenBucket(ctx, bucketURL)
	if err != nil {
		return nil, fmt.Errorf("open blob bucket %q: %w", bucketURL, err)
	}
	return &Client{bucket: bucket}, nil
}

// NewFromBucket wraps an already-opened *blob.Bucket.
// Useful in tests where a pre-built bucket (e.g. memblob) is injected directly.
// The caller retains ownership of the bucket and is responsible for closing it.
func NewFromBucket(bucket *blob.Bucket) *Client {
	return &Client{bucket: bucket}
}

// Close releases resources held by the underlying bucket connection.
func (c *Client) Close() error {
	return c.bucket.Close()
}

// UploadContent uploads a content string to the bucket at filePath.
// A 30-second write timeout is applied.
func (c *Client) UploadContent(ctx context.Context, filePath, content string) error {
	writeCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	w, err := c.bucket.NewWriter(writeCtx, filePath, &blob.WriterOptions{
		ContentType: "text/html",
	})
	if err != nil {
		return fmt.Errorf("new blob writer %s: %w", filePath, err)
	}

	if _, err := io.Copy(w, strings.NewReader(content)); err != nil {
		_ = w.Close()
		return fmt.Errorf("write blob %s: %w", filePath, err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("close blob writer %s: %w", filePath, err)
	}

	log.Printf("Original content uploaded to %s", filePath)
	return nil
}

// UploadOriginalContent mirrors uploadOriginalContent() from request_handler.ts.
// It uploads content for each user at:
//
//	content/{userId}/{libraryItemId}.{timestampMs}.original
//
// Upload failures are logged but do not abort the remaining users.
func (c *Client) UploadOriginalContent(ctx context.Context, users []UserRef, content string, savedTimestamp int64) error {
	for _, user := range users {
		filePath := fmt.Sprintf("content/%s/%s.%d.original", user.ID, user.LibraryItemID, savedTimestamp)
		if err := c.UploadContent(ctx, filePath, content); err != nil {
			log.Printf("Failed to upload original content for user %s: %v", user.ID, err)
		}
	}
	return nil
}
