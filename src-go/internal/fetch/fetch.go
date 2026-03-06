// Package fetch implements content retrieval using chromedp (Chromium DevTools Protocol).
// It replicates the behaviour of packages/puppeteer-parse with equivalent Go logic.
package fetch

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/chromedp/cdproto/emulation"
	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
	"github.com/omnivore-app/omnivore/internal/browser"
)

// Result mirrors FetchResult from the TS implementation.
type Result struct {
	FinalURL    string
	Title       string
	Content     string
	ContentType string
}

// nonScriptHosts mirrors NON_SCRIPT_HOSTS – JS disabled for these.
var nonScriptHosts = []string{"medium.com", "fastcompany.com", "fortelabs.com"}

// allowedContentTypes mirrors ALLOWED_CONTENT_TYPES.
var allowedContentTypes = map[string]bool{
	"text/html":                true,
	"application/octet-stream": true,
	"text/plain":               true,
	"application/pdf":          true,
}

// noCacheURLs mirrors NO_CACHE_URLS from request_handler.ts (checked externally, listed here for reference).
var NoCacheURLs = map[string]bool{
	"https://deviceandbrowserinfo.com/are_you_a_bot": true,
	"https://deviceandbrowserinfo.com/info_device":   true,
	"https://jacksonh.org":                           true,
}

// FetchContent is the Go equivalent of fetchContent() in puppeteer-parse/src/index.ts.
func FetchContent(ctx context.Context, browser *browser.Browser, rawURL, locale, timezone string) (*Result, error) {
	start := time.Now()
	log.Printf("content-fetch request url=%s locale=%s timezone=%s", rawURL, locale, timezone)

	parsedURL, err := parseAndValidateURL(rawURL)
	if err != nil {
		return nil, err
	}
	targetURL := parsedURL.String()

	// Pre-handle: detect PDFs, images, and other special content types.
	preResult, err := preHandle(ctx, targetURL)
	if err != nil {
		log.Printf("pre-handle warning for %s: %v", targetURL, err)
		// Non-fatal; continue with browser fetch
	}

	if preResult != nil {
		if preResult.URL != "" {
			if p, err := parseAndValidateURL(preResult.URL); err == nil {
				targetURL = p.String()
			}
		}
		if preResult.ContentType == "application/pdf" || (preResult.Content != "" && preResult.Title != "") {
			return &Result{
				FinalURL:    targetURL,
				Title:       preResult.Title,
				Content:     preResult.Content,
				ContentType: preResult.ContentType,
			}, nil
		}
	}

	// Fall through to browser fetch
	result, err := retrievePage(ctx, browser, targetURL, locale, timezone)
	if err != nil {
		return nil, err
	}

	log.Printf("content-fetch done url=%s duration=%s", targetURL, time.Since(start))
	return result, nil
}

// preHandleResult carries the output of pre-handle checks.
type preHandleResult struct {
	URL         string
	Title       string
	Content     string
	ContentType string
}

// preHandle performs lightweight checks before launching the browser:
// - Detects PDF URLs (by extension or HEAD request)
// - Detects image content types
// Returns nil if normal browser rendering should proceed.
func preHandle(ctx context.Context, rawURL string) (*preHandleResult, error) {
	lower := strings.ToLower(rawURL)

	// PDF by extension
	if strings.HasSuffix(lower, ".pdf") || strings.Contains(lower, ".pdf?") {
		return &preHandleResult{URL: rawURL, ContentType: "application/pdf"}, nil
	}

	// Quick HEAD to detect content-type without full page load
	client := &http.Client{Timeout: 5 * time.Second, CheckRedirect: func(req *http.Request, via []*http.Request) error {
		if len(via) > 5 {
			return fmt.Errorf("too many redirects")
		}
		return nil
	}}

	req, err := http.NewRequestWithContext(ctx, http.MethodHead, rawURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; Omnivore/1.0)")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	ct := strings.ToLower(resp.Header.Get("Content-Type"))
	if ct != "" {
		ct = strings.SplitN(ct, ";", 2)[0]
		ct = strings.TrimSpace(ct)
	}

	if ct == "application/pdf" {
		return &preHandleResult{URL: resp.Request.URL.String(), ContentType: "application/pdf"}, nil
	}

	return nil, nil
}

// retrievePage navigates to the URL using the browser, waits for load and DOM settle,
// then captures the full document HTML.
func retrievePage(ctx context.Context, browser *browser.Browser, targetURL, locale, timezone string) (*Result, error) {
	tabCtx, cancel, err := browser.NewContext()
	if err != nil {
		return nil, fmt.Errorf("new browser context: %w", err)
	}
	defer cancel()

	// Timeout for the entire page load + DOM settle
	tabCtx, timeoutCancel := context.WithTimeout(tabCtx, 60*time.Second)
	defer timeoutCancel()

	result := &Result{FinalURL: targetURL}

	disableJS := shouldDisableJS(targetURL)

	// Track final URL (after redirects) and content-type via network events
	var finalURL string
	var contentType string
	var lastPDFURL string

	chromedp.ListenTarget(tabCtx, func(ev interface{}) {
		switch e := ev.(type) {
		case *network.EventResponseReceived:
			if e.Type == network.ResourceTypeDocument {
				ct := strings.ToLower(e.Response.MimeType)
				if ct == "application/pdf" {
					lastPDFURL = e.Response.URL
				}
				if finalURL == "" {
					finalURL = e.Response.URL
					if ct, ok := e.Response.Headers["content-type"].(string); ok {
						contentType = ct
					}
					if contentType == "" {
						contentType = e.Response.MimeType
					}
				}
			}
		}
	})

	var actions []chromedp.Action

	// Set locale header
	if locale != "" {
		actions = append(actions, network.SetExtraHTTPHeaders(network.Headers{
			"Accept-Language": locale,
		}))
	}

	if disableJS {
		actions = append(actions, chromedp.ActionFunc(func(ctx context.Context) error {
			return emulation.SetScriptExecutionDisabled(true).Do(ctx)
		}))
	}

	// Navigate
	actions = append(actions, chromedp.Navigate(targetURL))

	// Wait for DOM to settle (equivalent to waitForDOMToSettle)
	actions = append(actions, chromedp.ActionFunc(func(ctx context.Context) error {
		return waitForDOMSettle(ctx, 5*time.Second, 1*time.Second)
	}))

	// Scroll the page
	actions = append(actions, chromedp.ActionFunc(func(ctx context.Context) error {
		return scrollPage(ctx, 5*time.Second)
	}))

	// Capture title
	actions = append(actions, chromedp.Title(&result.Title))

	// Capture and clean DOM
	var domContent string
	actions = append(actions, chromedp.ActionFunc(func(ctx context.Context) error {
		return captureAndCleanDOM(ctx, &domContent)
	}))

	if err := chromedp.Run(tabCtx, actions...); err != nil {
		if lastPDFURL != "" {
			return &Result{FinalURL: lastPDFURL, ContentType: "application/pdf"}, nil
		}
		return nil, fmt.Errorf("chromedp run: %w", err)
	}

	if domContent == "IS_BLOCKED" {
		return nil, fmt.Errorf("page is blocked by anti-bot protection")
	}

	if finalURL != "" {
		result.FinalURL = finalURL
	}
	result.Content = domContent
	result.ContentType = contentType

	return result, nil
}

// waitForDOMSettle runs a MutationObserver via JS to wait until DOM mutations settle.
// Mirrors waitForDOMToSettle from puppeteer-parse.
func waitForDOMSettle(ctx context.Context, timeout, debounce time.Duration) error {
	timeoutMs := int(timeout.Milliseconds())
	debounceMs := int(debounce.Milliseconds())

	script := fmt.Sprintf(`
		new Promise((resolve) => {
			const timeoutMs = %d;
			const debounceMs = %d;
			let debounceTimer;
			const mainTimeout = setTimeout(() => {
				observer.disconnect();
				resolve();
			}, timeoutMs);
			const debouncedResolve = () => {
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(() => {
					observer.disconnect();
					clearTimeout(mainTimeout);
					resolve();
				}, debounceMs);
			};
			const observer = new MutationObserver(debouncedResolve);
			observer.observe(document.body, { attributes: true, childList: true, subtree: true });
		})
	`, timeoutMs, debounceMs)

	return chromedp.Evaluate(script, nil).Do(ctx)
}

// scrollPage scrolls the entire page with a timeout, mirroring the Puppeteer scroll logic.
func scrollPage(ctx context.Context, timeout time.Duration) error {
	scrollCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	script := `
		new Promise((resolve) => {
			let scrollHeight = document.body.scrollHeight;
			let totalHeight = 0;
			let distance = 500;
			let timer = setInterval(() => {
				window.scrollBy(0, distance);
				totalHeight += distance;
				if (totalHeight >= scrollHeight) {
					clearInterval(timer);
					resolve(true);
				}
			}, 10);
		})
	`
	err := chromedp.Evaluate(script, nil).Do(scrollCtx)
	if err != nil && scrollCtx.Err() != nil {
		return nil // Timeout during scroll is acceptable
	}
	return err
}

// captureAndCleanDOM evaluates JS to clean the DOM and return the outerHTML.
// Mirrors the page.evaluate block in retrieveHtml() from puppeteer-parse/src/index.ts.
func captureAndCleanDOM(ctx context.Context, result *string) error {
	script := `
		(function() {
			const BI_SRC_REGEXP = /url\("(.+?)"\)/gi;

			Array.from(document.body.getElementsByTagName('*')).forEach((el) => {
				const style = window.getComputedStyle(el);
				const src = el.getAttribute('src');

				try {
					if (el.tagName && ['img', 'image'].includes(el.tagName.toLowerCase())) {
						const filter = style.getPropertyValue('filter');
						if (filter && filter.startsWith('blur')) {
							el.parentNode && el.parentNode.removeChild(el);
							return;
						}
					}
				} catch(err) {}

				const bgImage = style.getPropertyValue('background-image');
				if (bgImage && !['', 'none'].includes(bgImage)) {
					const filter = style.getPropertyValue('filter');
					if (filter && filter.startsWith('blur')) {
						el && el.parentNode && el.parentNode.removeChild(el);
					} else {
						BI_SRC_REGEXP.lastIndex = 0;
						const matchedSRC = BI_SRC_REGEXP.exec(bgImage);
						BI_SRC_REGEXP.lastIndex = 0;
						if (matchedSRC && matchedSRC[1] && !src) {
							if (!el.textContent) {
								const img = document.createElement('img');
								img.src = matchedSRC[1];
								el && el.parentNode && el.parentNode.replaceChild(img, el);
							}
						}
					}
				}

				if (el.tagName === 'IFRAME') {
					// Instagram iframe handling omitted (requires cross-frame access unavailable in CDP)
				}
			});

			if (
				document.querySelector('[data-translate="managed_checking_msg"]') ||
				document.getElementById('px-block-form-wrapper')
			) {
				return 'IS_BLOCKED';
			}

			return document.documentElement.outerHTML;
		})()
	`
	return chromedp.Evaluate(script, result).Do(ctx)
}

// shouldDisableJS returns true for domains where JS should be disabled (mirrors NON_SCRIPT_HOSTS).
func shouldDisableJS(rawURL string) bool {
	u, err := url.Parse(rawURL)
	if err != nil {
		return false
	}
	hostname := u.Hostname()
	for _, host := range nonScriptHosts {
		if strings.HasSuffix(hostname, host) {
			return true
		}
	}
	return false
}

// parseAndValidateURL validates and normalises the URL, mirroring validateUrlString + getUrl.
func parseAndValidateURL(rawURL string) (*url.URL, error) {
	// Extract first URL if embedded in a string
	re := regexp.MustCompile(`(https?://[^\s]+)`)
	matches := re.FindStringSubmatch(rawURL)
	if len(matches) == 0 {
		return nil, fmt.Errorf("no URL found in: %s", rawURL)
	}
	rawURL = matches[1]

	u, err := url.Parse(rawURL)
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	if u.Scheme != "http" && u.Scheme != "https" {
		return nil, fmt.Errorf("invalid URL protocol: %s", u.Scheme)
	}

	hostname := u.Hostname()
	if hostname == "localhost" || hostname == "0.0.0.0" {
		return nil, fmt.Errorf("URL points to localhost")
	}

	if isPrivateIP(hostname) {
		return nil, fmt.Errorf("URL points to private IP: %s", hostname)
	}

	return u, nil
}

var privateIPRanges = []*regexp.Regexp{
	regexp.MustCompile(`^10\.`),
	regexp.MustCompile(`^172\.(1[6-9]|2[0-9]|3[0-1])\.`),
	regexp.MustCompile(`^192\.168\.`),
}

func isPrivateIP(hostname string) bool {
	// Try resolving if it's a hostname
	ip := net.ParseIP(hostname)
	if ip == nil {
		return false
	}
	s := ip.String()
	for _, re := range privateIPRanges {
		if re.MatchString(s) {
			return true
		}
	}
	return false
}

// FetchPDF downloads a PDF directly and returns its bytes (for GCS upload).
func FetchPDF(ctx context.Context, rawURL string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; Omnivore/1.0)")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var buf bytes.Buffer
	if _, err := io.Copy(&buf, resp.Body); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
