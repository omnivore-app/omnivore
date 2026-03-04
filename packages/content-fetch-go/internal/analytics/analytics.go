// Package analytics wraps PostHog event capture, matching the analytics.ts behaviour.
package analytics

import (
	"log"

	"github.com/omnivore-app/omnivore/content-fetch-go/internal/config"
	"github.com/posthog/posthog-go"
)

// Client sends analytics events to PostHog.
type Client struct {
	ph     posthog.Client
	config    *config.Config
}

// Event carries data for an analytics capture call.
type Event struct {
	Result     string // "success" or "failure"
	URL        string
	Source     string
	TotalTime  int64  // milliseconds
	ErrorMessage string
}

// New creates a PostHog analytics client.
func New(config *config.Config) *Client {
	ph, err := posthog.NewWithConfig(config.PostHogAPIKey, posthog.Config{})
	if err != nil {
		log.Printf("Failed to create PostHog client: %v", err)
		return &Client{config: config}
	}
	return &Client{ph: ph, config: config}
}

// Capture sends a content_fetch_result event.
// Only failure events are sent when SEND_ANALYTICS is set, matching the TS behaviour.
func (c *Client) Capture(userIDs []string, ev Event) {
	if c.ph == nil {
		return
	}
	if !c.config.SendAnalytics || ev.Result != "failure" {
		return
	}

	for _, uid := range userIDs {
		props := posthog.NewProperties().
			Set("url", ev.URL).
			Set("source", ev.Source).
			Set("totalTime", ev.TotalTime).
			Set("env", c.config.APIEnv)
		if ev.ErrorMessage != "" {
			props.Set("errorMessage", ev.ErrorMessage)
		}

		if err := c.ph.Enqueue(posthog.Capture{
			DistinctId: uid,
			Event:      "content_fetch_" + ev.Result,
			Properties: props,
		}); err != nil {
			log.Printf("PostHog enqueue error: %v", err)
		}
	}
}

// Close flushes and closes the PostHog client.
func (c *Client) Close() {
	if c.ph != nil {
		if err := c.ph.Close(); err != nil {
			log.Printf("PostHog close error: %v", err)
		}
	}
}
