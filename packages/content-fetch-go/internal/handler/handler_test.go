package handler

import (
	"encoding/json"
	"testing"
)

// TestJobData_UnmarshalLabelsAsObjects verifies that the labels field is correctly
// decoded when the queue-processor sends label objects like {"name":"RSS"} rather
// than plain strings.  This is the exact payload shape produced by refreshFeed.ts:
//
//	labels: [{ name: 'RSS' }]
func TestJobData_UnmarshalLabelsAsObjects(t *testing.T) {
	raw := `{
		"url": "https://example.com/article",
		"users": [{"id": "user-1", "libraryItemId": "item-1"}],
		"priority": "low",
		"labels": [{"name": "RSS"}],
		"rssFeedUrl": "https://example.com/feed.xml",
		"savedAt": "2026-01-20T00:00:00.000Z",
		"publishedAt": "2026-01-20T00:00:00.000Z",
		"source": "rss-feeder"
	}`

	var data JobData
	if err := json.Unmarshal([]byte(raw), &data); err != nil {
		t.Fatalf("unmarshal error (was labels declared as []string instead of []LabelInput?): %v", err)
	}

	if len(data.Labels) != 1 {
		t.Fatalf("expected 1 label, got %d", len(data.Labels))
	}
	if data.Labels[0].Name != "RSS" {
		t.Errorf("expected label name 'RSS', got %q", data.Labels[0].Name)
	}
	if data.Labels[0].Color != nil {
		t.Errorf("expected color nil, got %v", data.Labels[0].Color)
	}
}

// TestJobData_UnmarshalLabelsWithColor verifies a label with optional color field.
func TestJobData_UnmarshalLabelsWithColor(t *testing.T) {
	color := "#FF0000"
	raw := `{
		"url": "https://example.com/article",
		"priority": "high",
		"labels": [{"name": "Important", "color": "#FF0000"}]
	}`

	var data JobData
	if err := json.Unmarshal([]byte(raw), &data); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}

	if len(data.Labels) != 1 {
		t.Fatalf("expected 1 label, got %d", len(data.Labels))
	}
	if data.Labels[0].Name != "Important" {
		t.Errorf("label name: got %q, want %q", data.Labels[0].Name, "Important")
	}
	if data.Labels[0].Color == nil || *data.Labels[0].Color != color {
		t.Errorf("label color: got %v, want %q", data.Labels[0].Color, color)
	}
}

// TestJobData_UnmarshalNoLabels verifies that omitting labels entirely is valid.
func TestJobData_UnmarshalNoLabels(t *testing.T) {
	raw := `{"url": "https://example.com/article", "priority": "high"}`

	var data JobData
	if err := json.Unmarshal([]byte(raw), &data); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if len(data.Labels) != 0 {
		t.Errorf("expected 0 labels, got %d", len(data.Labels))
	}
}

// TestJobData_UnmarshalMultipleLabels verifies multiple label objects decode correctly.
func TestJobData_UnmarshalMultipleLabels(t *testing.T) {
	raw := `{
		"url": "https://example.com/article",
		"priority": "low",
		"labels": [
			{"name": "RSS"},
			{"name": "Tech", "color": "#00FF00"},
			{"name": "Reading", "description": "To read later"}
		]
	}`

	var data JobData
	if err := json.Unmarshal([]byte(raw), &data); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if len(data.Labels) != 3 {
		t.Fatalf("expected 3 labels, got %d", len(data.Labels))
	}

	names := []string{"RSS", "Tech", "Reading"}
	for i, want := range names {
		if data.Labels[i].Name != want {
			t.Errorf("label[%d]: got %q, want %q", i, data.Labels[i].Name, want)
		}
	}

	if data.Labels[2].Description == nil || *data.Labels[2].Description != "To read later" {
		t.Errorf("label[2] description: got %v, want %q", data.Labels[2].Description, "To read later")
	}
}

// TestSavePageJobData_MarshalLabels verifies that outgoing save-page jobs
// serialise labels back as objects (not strings), preserving the shape the
// backend queue-processor expects.
func TestSavePageJobData_MarshalLabels(t *testing.T) {
	color := "#123456"
	job := savePageJobData{
		UserID:                 "user-1",
		URL:                    "https://example.com",
		FinalURL:               "https://example.com",
		ArticleSavingRequestID: "item-1",
		Source:                 "rss-feeder",
		Labels: []LabelInput{
			{Name: "RSS"},
			{Name: "Custom", Color: &color},
		},
	}

	b, err := json.Marshal(job)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}

	var out map[string]interface{}
	if err := json.Unmarshal(b, &out); err != nil {
		t.Fatalf("re-unmarshal error: %v", err)
	}

	rawLabels, ok := out["labels"].([]interface{})
	if !ok {
		t.Fatalf("labels field is not an array: %T", out["labels"])
	}
	if len(rawLabels) != 2 {
		t.Fatalf("expected 2 labels, got %d", len(rawLabels))
	}

	// Each label must be an object, not a string.
	for i, l := range rawLabels {
		lmap, ok := l.(map[string]interface{})
		if !ok {
			t.Errorf("label[%d] is not an object: %T (%v)", i, l, l)
			continue
		}
		if _, hasName := lmap["name"]; !hasName {
			t.Errorf("label[%d] missing 'name' key", i)
		}
	}

	first := rawLabels[0].(map[string]interface{})
	if first["name"] != "RSS" {
		t.Errorf("first label name: got %v, want %q", first["name"], "RSS")
	}

	second := rawLabels[1].(map[string]interface{})
	if second["color"] != "#123456" {
		t.Errorf("second label color: got %v, want %q", second["color"], "#123456")
	}
}
