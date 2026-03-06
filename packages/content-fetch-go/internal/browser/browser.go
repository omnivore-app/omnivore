// Package browser manages a shared headless Chromium instance via chromedp.
package browser

import (
	"context"
	"fmt"
	"log"
	"sync"

	"github.com/chromedp/chromedp"
	"github.com/omnivore-app/omnivore/content-fetch-go/internal/config"
)

// Browser wraps a persistent chromedp browser allocator.
type Browser struct {
	config         *config.Config
	allocCtx    context.Context
	allocCancel context.CancelFunc
	mu          sync.Mutex
}

func New(config *config.Config) *Browser {
	return &Browser{config: config}
}

// allocatorOpts returns the chromedp ExecAllocator options matching the original Puppeteer args.
func (b *Browser) allocatorOpts() []chromedp.ExecAllocatorOption {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("autoplay-policy", "user-gesture-required"),
		chromedp.Flag("disable-component-update", true),
		chromedp.Flag("disable-domain-reliability", true),
		chromedp.Flag("disable-print-preview", true),
		chromedp.Flag("disable-setuid-sandbox", true),
		chromedp.Flag("disable-speech-api", true),
		chromedp.Flag("enable-features", "SharedArrayBuffer"),
		chromedp.Flag("hide-scrollbars", true),
		chromedp.Flag("mute-audio", true),
		chromedp.Flag("no-default-browser-check", true),
		chromedp.Flag("no-pings", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("no-zygote", true),
		chromedp.Flag("disable-extensions", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.Flag("no-first-run", true),
		chromedp.Flag("disable-background-networking", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("disable-software-rasterizer", true),
		chromedp.Flag("ignore-certificate-errors", true),
		chromedp.WindowSize(1920, 1080),
		chromedp.Headless,
	)

	if b.config.ChromiumPath != "" && !b.config.UseFirefox {
		opts = append(opts, chromedp.ExecPath(b.config.ChromiumPath))
	}

	return opts
}

// getAllocator returns the shared browser allocator context, creating it if needed.
func (b *Browser) getAllocator() (context.Context, error) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.allocCtx != nil {
		// Check if still alive
		select {
		case <-b.allocCtx.Done():
			// Allocator died, recreate
			b.allocCtx = nil
			b.allocCancel = nil
		default:
			return b.allocCtx, nil
		}
	}

	log.Println("Starting chromedp browser allocator")
	ctx, cancel := chromedp.NewExecAllocator(context.Background(), b.allocatorOpts()...)
	b.allocCtx = ctx
	b.allocCancel = cancel
	return ctx, nil
}

// NewContext creates a new browser tab context using the shared allocator.
func (b *Browser) NewContext() (context.Context, context.CancelFunc, error) {
	allocCtx, err := b.getAllocator()
	if err != nil {
		return nil, nil, fmt.Errorf("get allocator: %w", err)
	}

	ctx, cancel := chromedp.NewContext(allocCtx)
	return ctx, cancel, nil
}

// Close shuts down the browser.
func (b *Browser) Close() {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.allocCancel != nil {
		b.allocCancel()
		b.allocCancel = nil
		b.allocCtx = nil
		log.Println("Browser closed")
	}
}
