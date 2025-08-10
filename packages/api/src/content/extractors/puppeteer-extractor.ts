/**
 * Puppeteer Content Extractor
 *
 * Uses Puppeteer/Chromium to extract content from web pages with JavaScript support.
 * Based on the existing puppeteer-parse functionality.
 */

import { Browser, Page, BrowserContext } from 'puppeteer-core'
import puppeteer from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { parseHTML } from 'linkedom'
import { logger as baseLogger } from '../../utils/logger'
import {
  ContentExtractor,
  RawContent,
  ExtractionOptions,
  ContentExtractionError,
} from '../types'

// Configure puppeteer plugins
if (process.env['USE_FIREFOX'] !== 'true') {
  puppeteer.use(StealthPlugin())
  puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
}

export class PuppeteerExtractor implements ContentExtractor {
  public readonly name = 'puppeteer-extractor'
  private logger = baseLogger.child({ context: 'puppeteer-extractor' })
  private browserInstance: Browser | null = null
  private isInitializing = false

  /**
   * Check if this extractor can handle the given URL
   */
  canExtract(url: string, options: ExtractionOptions): boolean {
    try {
      new URL(url) // Basic URL validation
      return true // Puppeteer can handle most URLs
    } catch {
      return false
    }
  }

  /**
   * Extract content from URL using Puppeteer
   */
  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    const startTime = Date.now()
    let context: BrowserContext | undefined
    let page: Page | undefined

    this.logger.debug('Starting Puppeteer extraction', { url, options })

    try {
      // Get browser instance
      const browser = await this.getBrowser()
      context = await browser.createBrowserContext()

      // Create page with options
      page = await this.createPage(context, options)

      // Navigate to URL
      const response = await this.navigateToUrl(page, url, options)

      // Wait for content to load
      await this.waitForContent(page, options)

      // Extract HTML content
      const html = await page.content()

      // Extract text content
      const textContent = await page.evaluate(() => {
        return document.body?.innerText || document.body?.textContent || ''
      })

      // Get final URL (after redirects)
      const finalUrl = page.url()

      // Get page title
      const title = await page.title()

      // Get content type from response
      const contentType = response?.headers()['content-type'] || 'text/html'

      const extractionTime = Date.now() - startTime

      this.logger.info('Puppeteer extraction completed', {
        url,
        finalUrl,
        title,
        contentLength: html.length,
        textLength: textContent.length,
        extractionTime,
      })

      // Parse DOM for further processing
      const { document: dom } = parseHTML(html)

      return {
        url: finalUrl,
        finalUrl,
        html,
        text: textContent,
        dom,
        contentType,
        headers: response?.headers() || {},
        metadata: {
          title,
          extractionTime,
          userAgent: options.userAgent,
          viewport: options.viewport,
        },
      }
    } catch (error) {
      const extractionTime = Date.now() - startTime

      this.logger.error('Puppeteer extraction failed', {
        url,
        extractionTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw new ContentExtractionError(
        `Puppeteer extraction failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        url,
        undefined,
        error instanceof Error ? error : undefined
      )
    } finally {
      // Cleanup resources
      if (page && !page.isClosed()) {
        try {
          await page.close()
        } catch (error) {
          this.logger.warn('Failed to close page', {
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      if (context) {
        try {
          await context.close()
        } catch (error) {
          this.logger.warn('Failed to close browser context', {
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }
  }

  /**
   * Get or create browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browserInstance && this.browserInstance.isConnected()) {
      return this.browserInstance
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      if (this.browserInstance && this.browserInstance.isConnected()) {
        return this.browserInstance
      }
    }

    this.isInitializing = true

    try {
      this.logger.info('Starting Puppeteer browser')

      this.browserInstance = (await puppeteer.launch({
        args: [
          '--autoplay-policy=user-gesture-required',
          '--disable-component-update',
          '--disable-domain-reliability',
          '--disable-print-preview',
          '--disable-setuid-sandbox',
          '--disable-speech-api',
          '--enable-features=SharedArrayBuffer',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-pings',
          '--no-sandbox',
          '--no-zygote',
          '--disable-extensions',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--disable-background-networking',
          '--disable-gpu',
          '--disable-software-rasterizer',
        ],
        defaultViewport: {
          deviceScaleFactor: 1,
          hasTouch: false,
          height: 1080,
          isLandscape: true,
          isMobile: false,
          width: 1920,
        },
        ignoreHTTPSErrors: true,
        executablePath:
          process.env.USE_FIREFOX === 'true'
            ? process.env.FIREFOX_PATH
            : process.env.CHROMIUM_PATH,
        headless: true,
        browser: process.env['USE_FIREFOX'] === 'true' ? 'firefox' : 'chrome',
        product: process.env['USE_FIREFOX'] === 'true' ? 'firefox' : 'chrome',
        timeout: 30000,
        dumpio: false,
      })) as Browser

      const version = await this.browserInstance.version()
      this.logger.info('Browser started', { version })

      // Handle disconnection
      this.browserInstance.on('disconnected', () => {
        this.logger.warn('Browser disconnected')
        this.browserInstance = null
      })

      return this.browserInstance
    } catch (error) {
      this.logger.error('Failed to start browser', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    } finally {
      this.isInitializing = false
    }
  }

  /**
   * Create and configure page
   */
  private async createPage(
    context: BrowserContext,
    options: ExtractionOptions
  ): Promise<Page> {
    const page = await context.newPage()

    // Set viewport if provided
    if (options.viewport) {
      await page.setViewport(options.viewport)
    }

    // Set user agent if provided
    if (options.userAgent) {
      await page.setUserAgent(options.userAgent)
    }

    // Set locale
    if (options.locale) {
      await page.setExtraHTTPHeaders({ 'Accept-Language': options.locale })
    }

    // Set timezone
    if (options.timezone && process.env['USE_FIREFOX'] !== 'true') {
      await page.emulateTimezone(options.timezone)
    }

    // Disable JavaScript if requested
    if (options.enableJavaScript === false) {
      await page.setJavaScriptEnabled(false)
    }

    // Set request timeout
    page.setDefaultTimeout(options.timeout || 30000)
    page.setDefaultNavigationTimeout(options.timeout || 30000)

    return page
  }

  /**
   * Navigate to URL with error handling
   */
  private async navigateToUrl(
    page: Page,
    url: string,
    options: ExtractionOptions
  ) {
    try {
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout || 30000,
      })

      if (!response) {
        throw new Error('No response received')
      }

      if (!response.ok() && response.status() >= 400) {
        // Allow some 4xx errors that might still have content
        const allowedErrorCodes = [401, 403, 404, 429]
        if (!allowedErrorCodes.includes(response.status())) {
          throw new Error(`HTTP ${response.status()}: ${response.statusText()}`)
        }
      }

      return response
    } catch (error) {
      throw new ContentExtractionError(
        `Navigation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        url
      )
    }
  }

  /**
   * Wait for content to load
   */
  private async waitForContent(
    page: Page,
    options: ExtractionOptions
  ): Promise<void> {
    try {
      // Wait for body element
      await page.waitForSelector('body', { timeout: 10000 })

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 })
      }

      // Execute custom scripts if provided
      if (options.customScripts && options.customScripts.length > 0) {
        for (const script of options.customScripts) {
          try {
            await page.evaluate(script)
          } catch (error) {
            this.logger.warn('Custom script execution failed', {
              script: script.substring(0, 100),
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }
      }

      // Auto-scroll to load dynamic content
      await this.autoScroll(page)

      // Wait for DOM to settle
      await this.waitForDOMToSettle(page)
    } catch (error) {
      this.logger.warn('Content waiting failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      // Don't throw here - we might still get some content
    }
  }

  /**
   * Auto-scroll page to trigger lazy loading
   */
  private async autoScroll(page: Page): Promise<void> {
    try {
      await Promise.race([
        page.evaluate(() => {
          return new Promise<void>((resolve) => {
            let totalHeight = 0
            const distance = 500
            const timer = setInterval(() => {
              window.scrollBy(0, distance)
              totalHeight += distance

              if (totalHeight >= document.body.scrollHeight) {
                clearInterval(timer)
                resolve()
              }
            }, 10)
          })
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 5000)), // 5 second timeout
      ])
    } catch (error) {
      this.logger.debug('Auto-scroll failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Wait for DOM to settle (stop changing)
   */
  private async waitForDOMToSettle(page: Page, timeout = 5000): Promise<void> {
    const startTime = Date.now()

    try {
      let lastBodySize = 0
      let stableCount = 0
      const requiredStableCount = 3

      while (Date.now() - startTime < timeout) {
        const currentBodySize = await page.evaluate(
          () => document.body.innerHTML.length
        )

        if (currentBodySize === lastBodySize) {
          stableCount++
          if (stableCount >= requiredStableCount) {
            break
          }
        } else {
          stableCount = 0
          lastBodySize = currentBodySize
        }

        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      this.logger.debug('DOM settle wait failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.browserInstance) {
      try {
        await this.browserInstance.close()
        this.logger.info('Browser closed')
      } catch (error) {
        this.logger.error('Failed to close browser', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      this.browserInstance = null
    }
  }

  /**
   * Get browser status
   */
  getStatus() {
    return {
      hasBrowser: !!this.browserInstance,
      isConnected: this.browserInstance?.isConnected() || false,
      isInitializing: this.isInitializing,
    }
  }
}
