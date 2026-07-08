package storage_test

import (
	"context"
	"fmt"
	"strings"
	"testing"

	"gocloud.dev/blob"
	"gocloud.dev/blob/memblob"

	"github.com/omnivore-app/omnivore/internal/storage"
)

// memClient creates a Client backed by an in-memory bucket.
// No Docker, no cloud credentials needed.
func memClient(t *testing.T) (*storage.Client, *blob.Bucket) {
	t.Helper()
	bucket := memblob.OpenBucket(nil)
	t.Cleanup(func() { _ = bucket.Close() })
	return storage.NewFromBucket(bucket), bucket
}

// TestUploadContent verifies that a single object is written with the correct key and body.
func TestUploadContent(t *testing.T) {
	ctx := context.Background()
	client, bucket := memClient(t)

	const key = "content/user-1/item-1.1700000000000.original"
	const body = "<html><body>Hello</body></html>"

	if err := client.UploadContent(ctx, key, body); err != nil {
		t.Fatalf("UploadContent error: %v", err)
	}

	exists, err := bucket.Exists(ctx, key)
	if err != nil {
		t.Fatalf("Exists error: %v", err)
	}
	if !exists {
		t.Fatalf("expected blob %q to exist after upload", key)
	}

	data, err := bucket.ReadAll(ctx, key)
	if err != nil {
		t.Fatalf("ReadAll error: %v", err)
	}
	if string(data) != body {
		t.Errorf("body mismatch: got %q, want %q", data, body)
	}
}

// TestUploadOriginalContent verifies that one blob per user is created at the
// correct path pattern: content/{userId}/{libraryItemId}.{timestampMs}.original
func TestUploadOriginalContent(t *testing.T) {
	ctx := context.Background()
	client, bucket := memClient(t)

	const ts = int64(1700000000000)
	const content = "<html><body>shared article</body></html>"

	refs := []storage.UserRef{
		{ID: "user-1", LibraryItemID: "item-1"},
		{ID: "user-2", LibraryItemID: "item-2"},
		{ID: "user-3", LibraryItemID: "item-3"},
	}

	if err := client.UploadOriginalContent(ctx, refs, content, ts); err != nil {
		t.Fatalf("UploadOriginalContent error: %v", err)
	}

	for _, ref := range refs {
		key := fmt.Sprintf("content/%s/%s.%d.original", ref.ID, ref.LibraryItemID, ts)

		exists, err := bucket.Exists(ctx, key)
		if err != nil {
			t.Fatalf("Exists(%s): %v", key, err)
		}
		if !exists {
			t.Errorf("expected blob %q to exist", key)
			continue
		}

		data, err := bucket.ReadAll(ctx, key)
		if err != nil {
			t.Fatalf("ReadAll(%s): %v", key, err)
		}
		if string(data) != content {
			t.Errorf("key %q: content mismatch: got %q, want %q", key, data, content)
		}
	}
}

// TestUploadOriginalContent_Empty verifies that an empty user slice produces no blobs.
func TestUploadOriginalContent_Empty(t *testing.T) {
	ctx := context.Background()
	client, bucket := memClient(t)

	if err := client.UploadOriginalContent(ctx, nil, "<html/>", 1700000000000); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Iterate to check no objects exist.
	iter := bucket.List(nil)
	obj, err := iter.Next(ctx)
	if err == nil {
		t.Errorf("expected no objects, found %q", obj.Key)
	}
}

// TestUploadContent_ContentType verifies the correct Content-Type is set on the blob.
func TestUploadContent_ContentType(t *testing.T) {
	ctx := context.Background()
	client, bucket := memClient(t)

	const key = "content/user/item.1700000000000.original"
	if err := client.UploadContent(ctx, key, "<html/>"); err != nil {
		t.Fatalf("UploadContent error: %v", err)
	}

	attrs, err := bucket.Attributes(ctx, key)
	if err != nil {
		t.Fatalf("Attributes error: %v", err)
	}
	if !strings.HasPrefix(attrs.ContentType, "text/html") {
		t.Errorf("expected Content-Type text/html, got %q", attrs.ContentType)
	}
}

// TestUploadContent_Overwrite verifies that uploading to the same key twice overwrites the content.
func TestUploadContent_Overwrite(t *testing.T) {
	ctx := context.Background()
	client, bucket := memClient(t)

	const key = "content/user/item.123.original"

	if err := client.UploadContent(ctx, key, "first"); err != nil {
		t.Fatalf("first upload: %v", err)
	}
	if err := client.UploadContent(ctx, key, "second"); err != nil {
		t.Fatalf("second upload: %v", err)
	}

	data, err := bucket.ReadAll(ctx, key)
	if err != nil {
		t.Fatalf("ReadAll: %v", err)
	}
	if string(data) != "second" {
		t.Errorf("expected %q, got %q", "second", data)
	}
}

// TestUploadOriginalContent_LargeContent verifies that large content uploads succeed.
func TestUploadOriginalContent_LargeContent(t *testing.T) {
	ctx := context.Background()
	client, bucket := memClient(t)

	// 1 MB of HTML
	content := strings.Repeat("x", 1024*1024)
	refs := []storage.UserRef{{ID: "u", LibraryItemID: "i"}}
	const ts = int64(1000)

	if err := client.UploadOriginalContent(ctx, refs, content, ts); err != nil {
		t.Fatalf("error: %v", err)
	}

	key := fmt.Sprintf("content/u/i.%d.original", ts)
	data, err := bucket.ReadAll(ctx, key)
	if err != nil {
		t.Fatalf("ReadAll: %v", err)
	}
	if len(data) != len(content) {
		t.Errorf("size mismatch: got %d bytes, want %d bytes", len(data), len(content))
	}
}
