// import { preHandleContent } from '@omnivore/content-handler' // Now implemented directly
import { BaseEvent } from './../events/event-manager'
import { Worker, Job } from 'bullmq'
import { Browser, BrowserContext, Page, Protocol, Target } from 'puppeteer-core'
import puppeteer from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import path from 'path'
import { createHash } from 'crypto'
import { existsSync } from 'fs'
import { logger as baseLogger } from '../utils/logger'
import { generateFingerprint } from '../utils/helpers'
import { redisDataSource } from '../redis_data_source'
import { ContentErrorClassifier } from '../errors/content-error-classifier'
import { ErrorCommunicationService } from '../services/error-communication.service'
import {
  ContentSaveRequestedEvent,
  ContentSaveRequestedEventData,
  EventType,
  ContentType,
} from '../events/content/content-save-event'
import { EventManager } from '../events/event-manager'
import { LibraryItemState, DirectionalityType } from '../entity/library_item'
import { PageType } from '../generated/graphql'
import { updateLibraryItem } from '../services/library_item'
import {
  ProcessedContentResult,
  processHtmlContent,
  processPdfContent,
  processEmailContent,
  processRssContent,
  processYouTubeContent,
} from './content-processing-service'
import { parsePreparedContent } from '../utils/parser'
import { PreparedDocumentInput } from '../generated/graphql'
import {
  applyLabelsToLibraryItem,
  generateThumbnail,
  applyRulesToLibraryItem,
} from './content-worker-helpers'

export const CONTENT_QUEUE_NAME = 'content-processing'
export const CONTENT_SAVE_JOB_NAME = 'process-content-save'

export interface ContentProcessingStartedEventData {
  libraryItemId: string
  userId: string
}

export interface ContentProcessingCompletedEventData {
  libraryItemId: string
  userId: string
}

export interface ContentProcessingFailedEventData {
  libraryItemId: string
  userId: string
  error: string
}

interface RawFetchResult {
  finalUrl: string
  title?: string
  content: string
  contentType?: string
}

export class ContentWorker {
  private logger = baseLogger.child({ context: 'content-worker' })
  private browserInstance: Browser | null = null
  private persistentContext: BrowserContext | null = null
  private currentFingerprint: any = null
  private errorClassifier = new ContentErrorClassifier()
  private errorCommunicationService = new ErrorCommunicationService()

  // Constants from puppeteer-parse
  private readonly NON_SCRIPT_HOSTS = [
    'medium.com',
    'fastcompany.com',
    'fortelabs.com',
  ]
  private readonly ALLOWED_CONTENT_TYPES = [
    'text/html',
    'application/octet-stream',
    'text/plain',
    'application/pdf',
  ]

  // Content handlers would go here when we fully integrate the handler system
  private eventManager = EventManager.getInstance()
  private worker!: Worker<ContentSaveRequestedEvent, boolean>

  constructor(concurrency = 2) {
    this.setupGlobalErrorHandlers()
    this.initializePuppeteer()
    this.initializeAndStart(concurrency)
  }

  /**
   * Setup global error handlers to catch unhandled promise rejections
   */
  private setupGlobalErrorHandlers(): void {
    // Remove default unhandledRejection listeners to prevent duplicate logging
    process.removeAllListeners('unhandledRejection')

    // Handle unhandled promise rejections from Firefox protocol operations
    process.on('unhandledRejection', (reason, promise) => {
      const reasonStr =
        reason instanceof Error ? reason.message : String(reason)

      // Ignore common Firefox protocol errors that don't affect functionality
      const ignoredErrors = [
        'network.failRequest',
        'Protocol error',
        'no such request',
        'Blocked request with id',
        'NS_ERROR_GENERATE_FAILURE',
        'NS_ERROR_UNKNOWN_HOST', // Add DNS errors to ignored list
        'SSL_ERROR_BAD_CERT_DOMAIN',
        'Request is already handled!',
        'Target closed',
        'Session closed',
      ]

      const shouldIgnore = ignoredErrors.some((pattern) =>
        reasonStr.includes(pattern)
      )

      if (shouldIgnore) {
        // Completely silent for Firefox protocol noise
        return
      } else {
        this.logger.error('Unhandled promise rejection', {
          reason: reasonStr,
          promise: promise.toString().substring(0, 100),
        })
      }
    })
  }

  private initializePuppeteer(): void {
    this.logger.info('Initializing puppeteer with Firefox-first approach')

    // Default to Firefox for better privacy and no Google services
    if (!process.env['USE_FIREFOX']) {
      process.env['USE_FIREFOX'] = 'true'
      this.logger.info('Defaulting to Firefox for enhanced privacy and stealth')
    }

    // Only use Chrome plugins if explicitly using Chrome
    if (process.env['USE_FIREFOX'] !== 'true') {
      puppeteer.use(StealthPlugin())
      puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
      this.logger.info('Initialized Chrome with stealth plugins')
    } else {
      this.logger.info('Using Firefox with built-in privacy features')
    }
  }

  private initializeAndStart(concurrency: number): void {
    const redisConnection = this.getRedisConnection()

    this.worker = new Worker<ContentSaveRequestedEvent, boolean>(
      CONTENT_QUEUE_NAME,
      this.processJob.bind(this),
      {
        connection: redisConnection,
        concurrency,
        limiter: { max: 10, duration: 1000 },
        autorun: true,
      }
    )

    this.setupEventHandlers()
    this.logger.info('Content worker started and ready')
  }

  private getRedisConnection() {
    if (!redisDataSource.workerRedisClient) {
      throw new Error('Redis worker client not initialized')
    }

    return {
      host: redisDataSource.workerRedisClient.options.host,
      port: redisDataSource.workerRedisClient.options.port,
      password: redisDataSource.workerRedisClient.options.password,
      db: redisDataSource.workerRedisClient.options.db,
    }
  }

  private async processJob(
    job: Job<ContentSaveRequestedEvent>
  ): Promise<boolean> {
    if (job.name !== CONTENT_SAVE_JOB_NAME) {
      this.logger.error(`${job.name}`, 'Unknown job type received')
      return false
    }

    const event = job.data

    this.logger.info(
      `${job.id} ${event.data.libraryItemId} ${event.data.url}`,
      'Processing content save job'
    )

    try {
      // Emit processing started event
      await this.eventManager.emit(
        new ContentProcessingStartedEvent({
          libraryItemId: event.data.libraryItemId,
          userId: event.data.userId,
        })
      )

      // Process content using the event data
      await this.processContent(event.data)

      // Emit processing completed event
      await this.eventManager.emit(
        new ContentProcessingCompletedEvent({
          libraryItemId: event.data.libraryItemId,
          userId: event.data.userId,
        })
      )

      return true
    } catch (error: any) {
      this.logger.error(
        `${job.id} ${event.data.libraryItemId} ${error.message}`,
        'Content processing failed'
      )

      // Emit processing failed event
      await this.eventManager.emit(
        new ContentProcessingFailedEvent({
          libraryItemId: event.data.libraryItemId,
          userId: event.data.userId,
          error: error.message,
        })
      )

      throw error
    }
  }

  public async processContent(
    eventData: ContentSaveRequestedEventData,
    attemptCount: number = 1
  ): Promise<void> {
    this.logger.info('Processing content', {
      url: eventData.url,
      libraryItemId: eventData.libraryItemId,
      attemptCount,
    })

    try {
      // STEP 1: Try specialized handlers first
      let fetchResult: ProcessedContentResult | null = null

      try {
        fetchResult = await this.tryContentHandlers(eventData.url)
        if (fetchResult) {
          this.logger.info('Content processed by specialized handler', {
            url: eventData.url,
            attemptCount,
          })
        }
      } catch (handlerError) {
        this.logger.debug('Handler failed, falling back to puppeteer', {
          url: eventData.url,
          error:
            handlerError instanceof Error ? handlerError.message : 'Unknown',
          attemptCount,
        })
      }

      // STEP 2: Fall back to direct puppeteer extraction
      if (!fetchResult) {
        fetchResult = await this.fetchContentDirectly(eventData.url)
      }

      this.logger.info('Fetch result', {
        fetchResult,
        attemptCount,
      })

      await this.saveProcessedContent(
        eventData.libraryItemId,
        eventData.userId,
        fetchResult
      )

      // Handle successful retry
      if (attemptCount > 1) {
        await this.errorCommunicationService.handleRetrySuccess(
          eventData.libraryItemId,
          eventData.userId,
          attemptCount
        )
      }
    } catch (error) {
      // Classify the error using our robust system
      const classifiedError = this.errorClassifier.classify(
        error instanceof Error ? error : new Error(String(error)),
        eventData.url
      )

      // Communicate error to user
      await this.errorCommunicationService.handleContentError(
        eventData.libraryItemId,
        eventData.userId,
        classifiedError,
        eventData.url,
        attemptCount
      )

      // Re-throw for job retry logic
      throw error
    }
  }

  /**
   * Try specialized content handlers first (Twitter, Medium, etc.)
   */
  private async tryContentHandlers(
    url: string
  ): Promise<ProcessedContentResult | null> {
    try {
      // Import the content-handler system dynamically
      const contentHandlerPath = path.resolve(
        __dirname,
        '../../content-handler/build/index.js'
      )

      if (existsSync(contentHandlerPath)) {
        const { preHandleContent } = require(contentHandlerPath)

        const preHandleResult = await preHandleContent(url)
        if (preHandleResult?.content) {
          this.logger.info('Content handled by specialized handler', { url })

          return await this.convertToProcessedContent({
            finalUrl: preHandleResult.url || url,
            title: preHandleResult.title,
            content: preHandleResult.content,
            contentType: 'text/html',
          })
        }
      } else {
        this.logger.debug('Content handler not available, using puppeteer', {
          url,
        })
      }
    } catch (error) {
      this.logger.debug('Content handler failed', {
        url,
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }

    return null
  }

  private async fetchContentDirectly(
    url: string,
    locale?: string,
    timezone?: string
  ): Promise<ProcessedContentResult> {
    const functionStartTime = Date.now()
    const logRecord = {
      url,
      functionStartTime,
      locale,
      timezone,
    }
    this.logger.info('content-fetch request', logRecord)

    let title: string | undefined,
      content: string | undefined,
      contentType: string | undefined,
      context: BrowserContext | undefined

    try {
      url = this.getUrl(url)

      // TODO: Pre-handle URL with custom handlers when handler system is fully integrated
      // For now, we'll proceed directly to puppeteer extraction

      if (contentType !== 'application/pdf' && (!content || !title)) {
        try {
          const result = await this.retrievePage(
            url,
            logRecord,
            functionStartTime,
            locale,
            timezone
          )
          context = result.context
          url = result.finalUrl
          contentType = result.contentType

          const page = result.page
          if (page) {
            const htmlResult = await this.retrieveHtml(page, logRecord)
            title = htmlResult.title
            content = htmlResult.domContent
          }
        } catch (retrieveError) {
          // Try HTTP fallback for SSL certificate errors on HTTPS URLs
          if (
            url.startsWith('https://') &&
            retrieveError instanceof Error &&
            retrieveError.message.includes('SSL certificate error')
          ) {
            this.logger.info('Trying HTTP fallback for SSL error', { url })
            try {
              const fallbackResult = await this.tryHttpFallback(
                url,
                logRecord,
                functionStartTime,
                locale,
                timezone
              )
              context = fallbackResult.context
              url = fallbackResult.finalUrl
              contentType = fallbackResult.contentType

              const page = fallbackResult.page
              if (page) {
                const htmlResult = await this.retrieveHtml(page, logRecord)
                title = htmlResult.title
                content = htmlResult.domContent
              }
            } catch (fallbackError) {
              this.logger.error('Both HTTPS and HTTP failed', {
                originalError: retrieveError.message,
                fallbackError:
                  fallbackError instanceof Error
                    ? fallbackError.message
                    : 'Unknown',
              })
              throw retrieveError // Throw original SSL error
            }
          } else {
            throw retrieveError
          }
        }
      }
    } catch (e) {
      this.logger.error(`Error while retrieving page ${url}`, e)
      throw e
    } finally {
      // Don't close persistent context - it maintains session state
      // Context will be closed when worker shuts down
      this.logger.info('content-fetch result', logRecord)
    }

    // Convert to ProcessedContentResult format through Readability processing
    return await this.convertToProcessedContent({
      finalUrl: url,
      title,
      content: content || '',
      contentType,
    })
  }

  private async convertToProcessedContent(
    rawResult: RawFetchResult
  ): Promise<ProcessedContentResult> {
    const rawHtml = rawResult.content || ''

    // Process the raw HTML through Readability and DOMPurify like the existing system
    const preparedDocument: PreparedDocumentInput = {
      document: rawHtml,
      pageInfo: {
        title: rawResult.title,
        canonicalUrl: rawResult.finalUrl,
        contentType: rawResult.contentType,
      },
    }

    try {
      // Pre-clean HTML to remove ads, scripts, and tracking before Readability
      const preCleanedHtml = this.preCleanHtml(rawHtml)
      const improvedPreparedDocument = {
        ...preparedDocument,
        document: preCleanedHtml,
      }

      this.logger.info('Processing with Readability', {
        originalLength: rawHtml.length,
        preCleanedLength: preCleanedHtml.length,
        reduction: `${Math.round(
          (1 - preCleanedHtml.length / rawHtml.length) * 100
        )}%`,
      })

      const parseResult = await parsePreparedContent(
        rawResult.finalUrl,
        improvedPreparedDocument
      )

      const cleanContent = parseResult.parsedContent?.content || preCleanedHtml
      const textContent = parseResult.parsedContent?.textContent || ''
      const actualWordCount = this.calculateAccurateWordCount(textContent)

      // Use parsed content data when available
      const title =
        parseResult.parsedContent?.title ||
        rawResult.title ||
        this.extractTitleFromUrl(rawResult.finalUrl)

      const wordCount = actualWordCount // Use the accurate word count we calculated

      const contentHash = this.generateContentHash(cleanContent)
      const readingTimeMinutes = Math.ceil(wordCount / 235) // 235 words per minute

      this.logger.info('Content processing completed', {
        title: title.substring(0, 80),
        wordCount,
        readingTimeMinutes,
        contentLength: cleanContent.length,
        textContentLength: textContent.length,
      })

      return {
        title,
        content: this.wrapContentForStyling(cleanContent), // Wrap for proper font inheritance
        wordCount,
        siteName:
          parseResult.parsedContent?.siteName ||
          this.extractSiteNameFromUrl(rawResult.finalUrl),
        itemType:
          parseResult.pageType || this.determinePageType(rawResult.contentType),
        contentHash,
        language: parseResult.parsedContent?.language || 'en',
        directionality:
          parseResult.parsedContent?.dir?.toLowerCase() === 'rtl'
            ? DirectionalityType.RTL
            : DirectionalityType.LTR,
        // Additional metadata from Readability
        description: parseResult.parsedContent?.excerpt,
        author: parseResult.parsedContent?.byline,
        publishedAt: parseResult.parsedContent?.publishedDate
          ? new Date(parseResult.parsedContent.publishedDate)
          : undefined,
        thumbnail: parseResult.parsedContent?.previewImage,
        siteIcon: parseResult.parsedContent?.siteIcon,
      }
    } catch (error) {
      this.logger.error(
        'Failed to process content through Readability, using raw content',
        {
          url: rawResult.finalUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      )

      // Fallback to raw processing if Readability fails
      const wordCount = this.countWords(rawHtml)
      const contentHash = this.generateContentHash(rawHtml)

      return {
        title: rawResult.title || this.extractTitleFromUrl(rawResult.finalUrl),
        content: this.wrapContentForStyling(rawHtml), // Also wrap fallback content
        wordCount,
        siteName: this.extractSiteNameFromUrl(rawResult.finalUrl),
        itemType: this.determinePageType(rawResult.contentType),
        contentHash,
        language: 'en',
        directionality: this.detectTextDirection(rawHtml),
      }
    }
  }

  private countWords(text: string): number {
    if (!text) return 0
    return text.trim().split(/\s+/).length
  }

  private generateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex')
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url)
      const pathname = parsedUrl.pathname

      // Remove file extensions and clean up
      const title = pathname
        .split('/')
        .pop()
        ?.replace(/\.[^/.]+$/, '')
        ?.replace(/[-_]/g, ' ')
        ?.replace(/\b\w/g, (l) => l.toUpperCase())

      return title || parsedUrl.hostname
    } catch {
      return url
    }
  }

  private extractSiteNameFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.hostname.replace(/^www\./, '')
    } catch {
      return 'Unknown Site'
    }
  }

  private determinePageType(contentType?: string): PageType {
    if (contentType?.includes('pdf')) {
      return PageType.File
    }
    return PageType.Article
  }

  private detectTextDirection(text: string): DirectionalityType {
    // Simple RTL detection based on common RTL characters
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF]/

    if (rtlRegex.test(text.substring(0, 100))) {
      return DirectionalityType.RTL
    }

    return DirectionalityType.LTR
  }

  /**
   * Wrap content for proper font styling inheritance
   * This fixes the font manipulation issue by ensuring CSS inheritance works correctly
   */
  private wrapContentForStyling(content: string): string {
    // Ensure content has proper wrapper for font inheritance
    const wrappedContent = content.replace(
      /<body[^>]*>/i,
      '<body class="omnivore-article-content">'
    )

    return `
      <div class="omnivore-reader-content" data-omnivore-content="true">
        <style>
          /* Ensure font properties inherit from parent */
          .omnivore-reader-content * {
            font-family: inherit !important;
            font-size: inherit !important;
            line-height: inherit !important;
          }
          
          /* Set up CSS variables for reader settings */
          .omnivore-reader-content {
            font-family: var(--reader-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            font-size: var(--reader-font-size, 20px);
            line-height: var(--reader-line-height, 1.5);
            color: var(--reader-text-color, #333);
            max-width: var(--reader-max-width, 100%);
            margin: 0 auto;
            padding: var(--reader-padding, 20px);
          }

          /* Preserve important styling while allowing inheritance */
          .omnivore-reader-content h1,
          .omnivore-reader-content h2,
          .omnivore-reader-content h3,
          .omnivore-reader-content h4,
          .omnivore-reader-content h5,
          .omnivore-reader-content h6 {
            font-family: inherit !important;
            line-height: 1.3 !important;
            margin-top: 1.5em !important;
            margin-bottom: 0.5em !important;
          }

          .omnivore-reader-content p {
            font-family: inherit !important;
            font-size: inherit !important;
            line-height: inherit !important;
            margin-bottom: 1em !important;
          }

          .omnivore-reader-content a {
            font-family: inherit !important;
            font-size: inherit !important;
          }

          .omnivore-reader-content blockquote {
            font-family: inherit !important;
            font-size: inherit !important;
            line-height: inherit !important;
            border-left: 4px solid #ddd;
            padding-left: 1em;
            margin: 1em 0;
            font-style: italic;
          }

          .omnivore-reader-content code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
            font-size: 0.9em !important;
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
          }

          .omnivore-reader-content pre {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
            background-color: #f5f5f5;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .omnivore-reader-content {
              padding: var(--reader-padding, 15px);
            }
          }
        </style>
        ${wrappedContent}
      </div>
    `
  }

  private async saveProcessedContent(
    libraryItemId: string,
    userId: string,
    fetchResult: ProcessedContentResult
  ): Promise<void> {
    this.logger.info('Saving processed content', {
      libraryItemId,
      title: fetchResult.title,
      contentLength: fetchResult.content?.length || 0,
      wordCount: fetchResult.wordCount,
      siteName: fetchResult.siteName,
      itemType: fetchResult.itemType,
    })

    try {
      // Update the library item with the processed content
      await updateLibraryItem(
        libraryItemId,
        {
          title: fetchResult.title,
          author: fetchResult.author,
          description: fetchResult.description,
          readableContent: fetchResult.content,
          previewContent: fetchResult.description, // Use description as preview
          wordCount: fetchResult.wordCount,
          siteName: fetchResult.siteName,
          siteIcon: fetchResult.siteIcon,
          thumbnail: fetchResult.thumbnail,
          itemType: fetchResult.itemType,
          textContentHash: fetchResult.contentHash,
          itemLanguage: fetchResult.language,
          directionality: fetchResult.directionality,
          publishedAt: fetchResult.publishedAt,
          state: LibraryItemState.Succeeded, // Mark as successfully processed
        },
        userId
      )

      this.logger.info('Successfully saved processed content to database', {
        libraryItemId,
        title: fetchResult.title,
        wordCount: fetchResult.wordCount,
      })
    } catch (error: any) {
      this.logger.error('Failed to save processed content to database', {
        libraryItemId,
        error: error.message,
        stack: error.stack,
      })
      throw error
    }
  }

  // ===== BROWSER MANAGEMENT =====

  /**
   * Check available browser installations on the system
   */
  private checkAvailableBrowsers(): {
    firefox: string | null
    chrome: string | null
  } {
    const firefoxPaths = [
      process.env.FIREFOX_PATH,
      '/Applications/Firefox.app/Contents/MacOS/firefox',
      '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox',
      '/usr/bin/firefox',
      '/usr/local/bin/firefox',
      '/opt/firefox/firefox',
    ].filter(Boolean)

    const chromePaths = [
      process.env.CHROMIUM_PATH,
      process.env.CHROME_PATH,
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/usr/bin/chromium',
      '/usr/bin/google-chrome',
    ].filter(Boolean)

    const firefox = firefoxPaths.find((path) => existsSync(path)) || null
    const chrome = chromePaths.find((path) => existsSync(path)) || null

    return { firefox, chrome }
  }

  /**
   * Create a fallback fingerprint when the main generator fails
   */
  private createFallbackFingerprint() {
    const commonViewports = [
      { width: 1920, height: 1080, devicePixelRatio: 1 },
      { width: 1366, height: 768, devicePixelRatio: 1 },
      { width: 1440, height: 900, devicePixelRatio: 1 },
      { width: 1536, height: 864, devicePixelRatio: 1.25 },
      { width: 1280, height: 720, devicePixelRatio: 1 },
    ]

    const randomViewport =
      commonViewports[Math.floor(Math.random() * commonViewports.length)]

    const firefoxUserAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/118.0',
    ]

    const randomUserAgent =
      firefoxUserAgents[Math.floor(Math.random() * firefoxUserAgents.length)]

    return {
      screen: {
        width: randomViewport.width,
        height: randomViewport.height,
        devicePixelRatio: randomViewport.devicePixelRatio,
        hasTouch: false,
        isMobile: false,
      },
      headers: {
        'user-agent': randomUserAgent,
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    }
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browserInstance) {
      return this.browserInstance
    }

    this.logger.info('Starting stealth puppeteer browser')

    // Generate realistic browser fingerprint (cache for session consistency)
    if (!this.currentFingerprint) {
      try {
        this.currentFingerprint = generateFingerprint()
        this.logger.info('Generated browser fingerprint', {
          userAgent:
            this.currentFingerprint.headers?.['user-agent'] || 'Unknown',
          viewport: `${this.currentFingerprint.screen?.width || 1920}x${
            this.currentFingerprint.screen?.height || 1080
          }`,
        })
      } catch (error) {
        this.logger.error('Failed to generate fingerprint, using fallback', {
          error,
        })
        this.currentFingerprint = this.createFallbackFingerprint()
      }
    }
    const fingerprint = this.currentFingerprint

    const launchOptions: any = {
      // Stealth-focused args (minimal detection footprint)
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

        // Disable Google services registration (CRITICAL for stealth)
        '--disable-features=ServiceWorker',
        '--disable-features=VizDisplayCompositor',
        '--disable-sync',
        '--disable-default-apps',
        '--disable-cloud-import',
        '--disable-translate',
        '--disable-client-side-phishing-detection',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--no-service-autorun',

        // Firefox requires additional SSL bypass arguments (Chrome uses ignoreHTTPSErrors)
        ...(process.env.USE_FIREFOX === 'true'
          ? [
              '--ignore-certificate-errors',
              '--ignore-ssl-errors',
              '--ignore-certificate-errors-spki-list',
              '--disable-web-security',
              '--allow-running-insecure-content',
              '--disable-features=VizDisplayCompositor',
              '--ignore-urlfetcher-cert-requests',
            ]
          : process.env.DISABLE_SSL_VERIFICATION === 'true'
          ? [
              '--ignore-certificate-errors',
              '--ignore-ssl-errors',
              '--ignore-certificate-errors-spki-list',
              '--disable-web-security',
            ]
          : []),
      ],

      // Use fingerprint-generated viewport for realism
      defaultViewport: {
        width: fingerprint.screen?.width || 1920,
        height: fingerprint.screen?.height || 1080,
        deviceScaleFactor: fingerprint.screen?.devicePixelRatio || 1,
        hasTouch: fingerprint.screen?.hasTouch || false,
        isLandscape:
          (fingerprint.screen?.width || 1920) >
          (fingerprint.screen?.height || 1080),
        isMobile: fingerprint.screen?.isMobile || false,
      },

      ignoreHTTPSErrors: true,
      headless: true,
      timeout: 30000,
      dumpio: false, // Disable verbose logging for stealth
      targetFilter: (target: Target) =>
        target.type() !== 'other' || !!target.url(),
    }

    // Intelligent browser selection using helper method
    const availableBrowsers = this.checkAvailableBrowsers()

    if (process.env.USE_FIREFOX === 'true') {
      if (availableBrowsers.firefox) {
        launchOptions.executablePath = availableBrowsers.firefox
        launchOptions.browser = 'firefox'
        launchOptions.product = 'firefox'

        // Firefox-specific privacy and popup blocking settings
        launchOptions.extraPrefsFirefox = {
          // Disable notifications and popups at browser level
          'dom.webnotifications.enabled': false,
          'dom.push.enabled': false,
          'dom.popup_maximum': 0,
          'privacy.popups.policy': 2, // Block all popups
          'dom.disable_open_during_load': true,

          // Enhanced privacy settings
          'privacy.trackingprotection.enabled': true,
          'privacy.trackingprotection.socialtracking.enabled': true,
          'privacy.trackingprotection.fingerprinting.enabled': true,
          'privacy.trackingprotection.cryptomining.enabled': true,

          // Disable telemetry and data collection
          'datareporting.healthreport.uploadEnabled': false,
          'datareporting.policy.dataSubmissionEnabled': false,
          'toolkit.telemetry.enabled': false,
          'toolkit.telemetry.unified': false,

          // Disable auto-updates and sync
          'app.update.enabled': false,
          'services.sync.enabled': false,

          // Media settings for better performance
          'media.autoplay.default': 5, // Block all autoplay
          'media.autoplay.blocking_policy': 2,

          // Comprehensive SSL bypass settings for content fetching
          'security.tls.insecure_fallback_hosts': '',
          'security.tls.unrestricted_rc4_fallback': false,
          'security.mixed_content.block_active_content': false,
          'security.mixed_content.block_display_content': false,
          'network.stricttransportsecurity.preloadlist': false,
          'security.cert_pinning.enforcement_level': 0, // Disable certificate pinning
          'security.tls.hello_downgrade_check': false, // Allow TLS downgrades
          'security.ssl.require_safe_negotiation': false, // Allow unsafe SSL negotiation
          'security.ssl.treat_unsafe_negotiation_as_broken': false,
          'security.ssl3.rsa_seed_sha': true, // Allow older SSL
          'security.tls.version.min': 1, // Allow TLS 1.0+
          'security.tls.version.max': 4, // Allow up to TLS 1.3
          'security.ssl.errorReporting.enabled': false, // Disable SSL error reporting
          'security.certerrors.mitm.priming.enabled': false, // Disable MITM detection
          'security.certerrors.recordEventTelemetry': false,
          'security.identitypopup.recordEventTelemetry': false,
        }

        this.logger.info('Using Firefox with enhanced privacy settings', {
          path: availableBrowsers.firefox,
          type: availableBrowsers.firefox.includes('Developer Edition')
            ? 'Developer Edition'
            : 'Standard',
        })
      } else if (availableBrowsers.chrome) {
        this.logger.debug('Firefox not found, falling back to Chrome', {
          chromeFound: availableBrowsers.chrome,
        })
        process.env.USE_FIREFOX = 'false'
        launchOptions.executablePath = availableBrowsers.chrome
        launchOptions.browser = 'chrome'
        launchOptions.product = 'chrome'
      } else {
        throw new Error(
          'No compatible browser found. Please install Firefox or Chrome.'
        )
      }
    } else {
      // Explicit Chrome usage
      if (availableBrowsers.chrome) {
        launchOptions.executablePath = availableBrowsers.chrome
        launchOptions.browser = 'chrome'
        launchOptions.product = 'chrome'
        this.logger.info('Using Chrome/Chromium with stealth plugins', {
          path: availableBrowsers.chrome,
        })
      } else {
        throw new Error(
          'Chrome/Chromium not found. Please install Chrome or set USE_FIREFOX=true.'
        )
      }
    }

    this.browserInstance = (await puppeteer.launch(
      launchOptions
    )) as unknown as Browser

    const version = await this.browserInstance.version()
    this.logger.info('Browser started', { version })

    this.browserInstance.on('disconnected', () => {
      this.handleDisconnection()
    })

    return this.browserInstance
  }

  private async handleDisconnection(): Promise<void> {
    this.logger.info('Browser disconnected, reconnecting...')
    this.browserInstance = null
    this.persistentContext = null
    await this.getBrowser()
  }

  /**
   * Get or create a persistent browser context for session management
   * This maintains cookies and session state across requests to the same domain
   */
  private async getPersistentContext(): Promise<BrowserContext> {
    if (this.persistentContext) {
      return this.persistentContext
    }

    const browser = await this.getBrowser()
    this.persistentContext = await browser.createBrowserContext()

    // Headers will be set per page since BrowserContext doesn't support setUserAgent

    this.logger.info(
      'Created persistent browser context with realistic headers'
    )
    return this.persistentContext
  }

  private async closeBrowser(): Promise<void> {
    // Close persistent context first
    if (this.persistentContext) {
      this.logger.info('Closing persistent browser context...')
      try {
        await this.persistentContext.close()
        this.logger.info('Persistent context closed successfully')
      } catch (error) {
        this.logger.error('Error closing persistent context:', error)
      } finally {
        this.persistentContext = null
      }
    }

    // Then close browser instance
    if (this.browserInstance) {
      this.logger.info('Closing browser...')
      try {
        await this.browserInstance.close()
        this.logger.info('Browser closed successfully')
      } catch (error) {
        this.logger.error('Error closing browser:', error)
      } finally {
        this.browserInstance = null
        this.currentFingerprint = null
      }
    }
  }

  // ===== URL VALIDATION AND PARSING =====

  private validateUrlString(url: string): boolean {
    try {
      const u = new URL(url)
      // Make sure the URL is http or https
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return false
      }
      // Make sure the domain is not localhost
      if (u.hostname === 'localhost' || u.hostname === '0.0.0.0') {
        return false
      }
      // Make sure the domain is not a private IP
      if (/^(10|172\.16|192\.168)\..*/.test(u.hostname)) {
        return false
      }
      return true
    } catch {
      return false
    }
  }

  private validateUrlStringStrict(url: string): void {
    const u = new URL(url)
    // Make sure the URL is http or https
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      throw new Error('Invalid URL protocol check failed')
    }
    // Make sure the domain is not localhost
    if (u.hostname === 'localhost' || u.hostname === '0.0.0.0') {
      throw new Error('Invalid URL is localhost')
    }
    // Make sure the domain is not a private IP
    if (/^(10|172\.16|192\.168)\..*/.test(u.hostname)) {
      throw new Error('Invalid URL is private ip')
    }
  }

  private tryParseUrl(urlStr: string): string | null {
    if (!urlStr) {
      return null
    }

    // A regular expression to match all URLs
    const regex = /(https?:\/\/[^\s]+)/g
    const matches = urlStr.match(regex)

    if (matches) {
      return matches[0] // only return first match
    } else {
      return null
    }
  }

  private getUrl(urlStr: string): string {
    const url = this.tryParseUrl(urlStr)
    if (!url) {
      throw new Error('No URL specified')
    }

    this.validateUrlStringStrict(url)

    const parsed = new URL(url)
    return parsed.href
  }

  private enableJavascriptForUrl(url: string): boolean {
    try {
      const u = new URL(url)
      for (const host of this.NON_SCRIPT_HOSTS) {
        if (u.hostname.endsWith(host)) {
          return false
        }
      }
    } catch (e) {
      this.logger.error('Error getting hostname for url', { url, error: e })
    }
    return true
  }

  // ===== PAGE RETRIEVAL =====

  /**
   * Try HTTP fallback for sites with completely broken HTTPS
   */
  private async tryHttpFallback(
    httpsUrl: string,
    logRecord: Record<string, any>,
    functionStartTime: number,
    locale?: string,
    timezone?: string
  ): Promise<any> {
    if (!httpsUrl.startsWith('https://')) {
      throw new Error('Not an HTTPS URL - cannot fallback to HTTP')
    }

    const httpUrl = httpsUrl.replace('https://', 'http://')
    this.logger.info('Attempting HTTP fallback for broken HTTPS', {
      originalUrl: httpsUrl,
      fallbackUrl: httpUrl,
    })

    try {
      return await this.retrievePage(
        httpUrl,
        logRecord,
        functionStartTime,
        locale,
        timezone
      )
    } catch (error) {
      this.logger.error('HTTP fallback also failed', {
        httpUrl,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Get site-specific loading strategy for optimal performance
   */
  private getSiteStrategy(url: string): {
    strategy: string
    timeout: number
    waitUntil: any[]
  } {
    try {
      const hostname = new URL(url).hostname.toLowerCase()

      // Slow-loading news sites that need extra time
      if (
        hostname.includes('antiwar.com') ||
        hostname.includes('cnn.com') ||
        hostname.includes('nytimes.com') ||
        hostname.includes('washingtonpost.com')
      ) {
        return {
          strategy: 'slow-news',
          timeout: 45 * 1000, // Extended timeout
          waitUntil: ['networkidle0'], // Wait for network to settle
        }
      }

      // Fast sites that load quickly
      if (
        hostname.includes('github.com') ||
        hostname.includes('stackoverflow.com') ||
        hostname.includes('medium.com') ||
        hostname.includes('substack.com')
      ) {
        return {
          strategy: 'fast',
          timeout: 20 * 1000,
          waitUntil: ['domcontentloaded'],
        }
      }

      // Default strategy for most sites
      return {
        strategy: 'default',
        timeout: 30 * 1000,
        waitUntil: ['load'],
      }
    } catch {
      return {
        strategy: 'fallback',
        timeout: 30 * 1000,
        waitUntil: ['load'],
      }
    }
  }

  /**
   * Pre-clean HTML to remove ads, scripts, and tracking elements before Readability
   * This improves Readability's ability to extract clean article content
   */
  private preCleanHtml(html: string): string {
    try {
      // Remove common ad and tracking elements that confuse Readability
      const cleanedHtml = html
        // Remove script tags and their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove style tags and their content
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // Remove common ad containers
        .replace(/<div[^>]*class="[^"]*ad[^"]*"[^>]*>.*?<\/div>/gi, '')
        .replace(/<div[^>]*id="[^"]*ad[^"]*"[^>]*>.*?<\/div>/gi, '')
        // Remove social media widgets
        .replace(/<div[^>]*class="[^"]*social[^"]*"[^>]*>.*?<\/div>/gi, '')
        .replace(/<div[^>]*class="[^"]*share[^"]*"[^>]*>.*?<\/div>/gi, '')
        // Remove newsletter signup forms
        .replace(/<div[^>]*class="[^"]*newsletter[^"]*"[^>]*>.*?<\/div>/gi, '')
        .replace(/<div[^>]*class="[^"]*signup[^"]*"[^>]*>.*?<\/div>/gi, '')
        // Remove comment sections
        .replace(/<div[^>]*class="[^"]*comment[^"]*"[^>]*>.*?<\/div>/gi, '')
        // Remove navigation elements
        .replace(/<nav\b[^>]*>.*?<\/nav>/gi, '')
        .replace(/<header\b[^>]*>.*?<\/header>/gi, '')
        .replace(/<footer\b[^>]*>.*?<\/footer>/gi, '')
        // Remove sidebar content
        .replace(/<aside\b[^>]*>.*?<\/aside>/gi, '')
        // Remove tracking pixels and beacons
        .replace(/<img[^>]*width="1"[^>]*height="1"[^>]*>/gi, '')
        .replace(/<img[^>]*height="1"[^>]*width="1"[^>]*>/gi, '')

      this.logger.info('Pre-cleaned HTML', {
        originalLength: html.length,
        cleanedLength: cleanedHtml.length,
        reductionPercent: Math.round(
          (1 - cleanedHtml.length / html.length) * 100
        ),
      })

      return cleanedHtml
    } catch (error) {
      this.logger.warn('HTML pre-cleaning failed, using original', { error })
      return html
    }
  }

  /**
   * Calculate accurate word count from text content
   */
  private calculateAccurateWordCount(textContent: string): number {
    if (!textContent || textContent.trim().length === 0) {
      return 0
    }

    // Remove extra whitespace and count meaningful words
    const words = textContent
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .split(' ')
      .filter((word) => word.length > 0 && !/^[^\w]+$/.test(word)) // Filter out non-word tokens

    return words.length
  }

  /**
   * Extract main content as fallback when Readability fails
   */
  private extractMainContent(html: string, title?: string): string {
    try {
      const { parseHTML } = require('linkedom')
      const document = parseHTML(html).document

      // Look for main content containers
      const contentSelectors = [
        'article',
        '[role="main"]',
        '.content',
        '.article-content',
        '.post-content',
        '.entry-content',
        '#content',
        '#main',
        '.main',
      ]

      for (const selector of contentSelectors) {
        const element = document.querySelector(selector)
        if (
          element &&
          element.textContent &&
          element.textContent.length > 200
        ) {
          return element.innerHTML
        }
      }

      // Fallback: try to find the largest text block
      const paragraphs = Array.from(
        document.querySelectorAll('p')
      ) as HTMLElement[]
      const largestParagraph = paragraphs
        .filter((p: HTMLElement) => p.textContent && p.textContent.length > 100)
        .sort(
          (a: HTMLElement, b: HTMLElement) =>
            (b.textContent?.length || 0) - (a.textContent?.length || 0)
        )[0]

      if (largestParagraph) {
        const parent = largestParagraph.parentElement
        return parent?.innerHTML || largestParagraph.outerHTML
      }

      return `<h1>${title || 'Content'}</h1><p>Content extraction failed</p>`
    } catch (error) {
      return `<h1>${
        title || 'Content'
      }</h1><p>Content extraction failed: ${error}</p>`
    }
  }

  /**
   * Aggressively remove popup elements from the DOM
   */
  private async removePopupsFromDOM(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        // Remove elements containing legal/terms content
        const legalSelectors = [
          '[class*="legal"]',
          '[id*="legal"]',
          '[class*="terms"]',
          '[id*="terms"]',
          '[class*="privacy"]',
          '[id*="privacy"]',
          '[class*="consent"]',
          '[id*="consent"]',
          '[class*="cookie"]',
          '[id*="cookie"]',
          '[class*="gdpr"]',
          '[id*="gdpr"]',
          '[role="dialog"]',
          '[aria-modal="true"]',
          '.modal',
          '.popup',
          '.overlay',
        ]

        legalSelectors.forEach((selector) => {
          try {
            const elements = document.querySelectorAll(selector)
            elements.forEach((el) => {
              // Check if element contains legal/terms text
              const text = el.textContent?.toLowerCase() || ''
              if (
                text.includes('legal terms') ||
                text.includes('privacy policy') ||
                text.includes('terms of use') ||
                text.includes('cookie policy') ||
                text.includes('by clicking') ||
                text.includes('agree to')
              ) {
                el.remove()
              }
            })
          } catch (e) {
            // Ignore errors for individual selectors
          }
        })

        // Remove high z-index fixed position elements (likely popups)
        const allElements = document.querySelectorAll('*')
        allElements.forEach((el) => {
          try {
            const style = window.getComputedStyle(el)
            const position = style.getPropertyValue('position')
            const zIndex = parseInt(style.getPropertyValue('z-index') || '0')

            if (position === 'fixed' && zIndex > 1000) {
              const text = el.textContent?.toLowerCase() || ''
              if (
                text.includes('legal') ||
                text.includes('terms') ||
                text.includes('privacy') ||
                text.includes('cookie') ||
                text.includes('consent') ||
                text.includes('agree')
              ) {
                el.remove()
              }
            }
          } catch (e) {
            // Ignore errors for individual elements
          }
        })
      })

      this.logger.info('Completed aggressive popup removal from DOM')
    } catch (error) {
      this.logger.info('DOM popup removal completed with minor issues')
    }
  }

  /**
   * Enhanced generic popup detection and dismissal using semantic patterns
   * This approach is sustainable and doesn't rely on site-specific implementations
   */
  private async dismissPopupsGeneric(page: Page): Promise<void> {
    try {
      this.logger.info('Attempting generic popup dismissal')

      // Step 1: Browser-level blocking via CSS injection
      await this.injectPopupBlockingCSS(page)

      // Step 2: Add realistic human reading delay
      await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)
      )

      // Step 3: Semantic popup detection and interaction
      const dismissalResult = await this.performSemanticPopupDismissal(page)

      if (dismissalResult.success) {
        this.logger.info(
          `Successfully dismissed popup: ${dismissalResult.method}`
        )

        // Human-like delay after interaction
        const clickDelay = Math.floor(Math.random() * 1000) + 500
        await new Promise((resolve) => setTimeout(resolve, clickDelay))
      }
    } catch (error) {
      this.logger.info('Generic popup dismissal completed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Inject CSS to hide common popup patterns at the browser level
   */
  private async injectPopupBlockingCSS(page: Page): Promise<void> {
    try {
      await page.addStyleTag({
        content: `
          /* Hide common popup and overlay patterns */
          [role="dialog"]:not([aria-label*="video"]):not([aria-label*="player"]),
          [aria-modal="true"]:not([aria-label*="video"]):not([aria-label*="player"]),
          .modal:not(.video-modal):not(.player-modal),
          .popup:not(.video-popup),
          .overlay:not(.video-overlay),
          .consent-banner,
          .cookie-banner,
          .gdpr-banner,
          .notification-banner,
          div[style*="position: fixed"][style*="z-index"]:not([class*="video"]):not([class*="player"]) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          
          /* Hide notification permission requests */
          .notification-permission,
          .push-notification,
          [class*="notification-prompt"],
          [id*="notification-prompt"] {
            display: none !important;
          }
          
          /* Hide newsletter signup overlays */
          .newsletter-popup,
          .email-signup,
          .subscription-modal,
          [class*="newsletter"]:not(article):not(.content) {
            display: none !important;
          }
          
          /* Aggressively hide legal terms and privacy popups */
          [class*="legal"],
          [id*="legal"],
          [class*="terms"],
          [id*="terms"],
          [class*="privacy"],
          [id*="privacy"],
          [class*="consent"],
          [id*="consent"],
          [class*="cookie"],
          [id*="cookie"],
          [class*="gdpr"],
          [id*="gdpr"],
          [class*="ccpa"],
          [id*="ccpa"],
          [aria-label*="Legal"],
          [aria-label*="Terms"],
          [aria-label*="Privacy"],
          [aria-label*="Cookie"],
          [aria-label*="Consent"],
          div[style*="position: fixed"]:has(button:contains("Agree")),
          div[style*="position: fixed"]:has(button:contains("Accept")),
          div[style*="position: fixed"]:has(button:contains("Continue")),
          div:contains("Legal Terms and Privacy"):not(article):not(.article-content) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            width: 0 !important;
            height: 0 !important;
            z-index: -999999 !important;
          }
        `,
      })
      this.logger.info('Injected popup blocking CSS')
    } catch (error) {
      this.logger.info('CSS injection completed with minor issues')
    }
  }

  /**
   * Perform semantic popup dismissal using multiple detection strategies
   */
  private async performSemanticPopupDismissal(
    page: Page
  ): Promise<{ success: boolean; method?: string }> {
    // Strategy 1: ARIA-based modal detection
    const ariaResult = await this.dismissAriaModals(page)
    if (ariaResult.success) return ariaResult

    // Strategy 2: Visual characteristics detection
    const visualResult = await this.dismissVisualPopups(page)
    if (visualResult.success) return visualResult

    // Strategy 3: Semantic text-based detection
    const textResult = await this.dismissTextBasedPopups(page)
    if (textResult.success) return textResult

    return { success: false }
  }

  /**
   * Dismiss popups using ARIA attributes (most reliable)
   */
  private async dismissAriaModals(
    page: Page
  ): Promise<{ success: boolean; method?: string }> {
    return await page.evaluate(() => {
      const modals = document.querySelectorAll(
        '[role="dialog"], [aria-modal="true"]'
      )

      for (const modal of modals) {
        // Skip video/media modals
        const modalText = modal.textContent?.toLowerCase() || ''
        if (modalText.includes('video') || modalText.includes('player'))
          continue

        // Look for dismiss buttons within the modal
        const dismissButtons = modal.querySelectorAll(
          'button, [role="button"], a'
        )

        for (const button of dismissButtons) {
          const buttonText = button.textContent?.trim().toLowerCase() || ''
          const ariaLabel =
            button.getAttribute('aria-label')?.toLowerCase() || ''

          const dismissKeywords = [
            'accept',
            'agree',
            'allow',
            'continue',
            'ok',
            'got it',
            'dismiss',
            'close',
            'x',
          ]

          if (
            dismissKeywords.some(
              (keyword) =>
                buttonText.includes(keyword) || ariaLabel.includes(keyword)
            )
          ) {
            ;(button as HTMLElement).click()
            return { success: true, method: 'ARIA modal dismissal' }
          }
        }
      }

      return { success: false }
    })
  }

  /**
   * Dismiss popups based on visual characteristics
   */
  private async dismissVisualPopups(
    page: Page
  ): Promise<{ success: boolean; method?: string }> {
    return await page.evaluate(() => {
      const allElements = document.querySelectorAll('*')

      for (const element of allElements) {
        const style = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()

        // Detect modal-like visual characteristics
        if (
          style.position === 'fixed' &&
          parseInt(style.zIndex) > 1000 &&
          rect.width > 200 &&
          rect.height > 100 &&
          rect.top < window.innerHeight / 2
        ) {
          // Look for dismiss buttons within this visual popup
          const buttons = element.querySelectorAll('button, [role="button"], a')

          for (const button of buttons) {
            const buttonRect = button.getBoundingClientRect()

            // Check if button is visible and clickable
            if (buttonRect.width > 0 && buttonRect.height > 0) {
              const text = button.textContent?.trim().toLowerCase() || ''
              const dismissKeywords = [
                'accept',
                'agree',
                'continue',
                'ok',
                'close',
              ]

              if (dismissKeywords.some((keyword) => text.includes(keyword))) {
                ;(button as HTMLElement).click()
                return { success: true, method: 'Visual popup dismissal' }
              }
            }
          }
        }
      }

      return { success: false }
    })
  }

  /**
   * Dismiss popups using semantic text analysis (fallback)
   */
  private async dismissTextBasedPopups(
    page: Page
  ): Promise<{ success: boolean; method?: string }> {
    return await page.evaluate(() => {
      const consentKeywords = [
        'accept all',
        'accept cookies',
        'agree and continue',
        'i agree',
        'allow all',
        'continue',
        'got it',
        'understand',
        'ok',
      ]

      const buttons = document.querySelectorAll(
        'button, [role="button"], a, input[type="button"]'
      )

      for (const button of buttons) {
        const text = button.textContent?.trim().toLowerCase() || ''
        const value = (button as HTMLInputElement).value?.toLowerCase() || ''
        const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || ''

        const fullText = `${text} ${value} ${ariaLabel}`.trim()

        // Check for exact matches with consent keywords
        if (consentKeywords.some((keyword) => fullText.includes(keyword))) {
          const rect = button.getBoundingClientRect()
          const style = window.getComputedStyle(button as Element)

          // Ensure button is visible and clickable
          if (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            !button.hasAttribute('disabled')
          ) {
            ;(button as HTMLElement).click()
            return { success: true, method: 'Text-based popup dismissal' }
          }
        }
      }

      return { success: false }
    })
  }

  private waitForDOMToSettle = (
    page: Page,
    timeoutMs = 5000,
    debounceMs = 1000
  ) =>
    page.evaluate(
      (timeoutMs, debounceMs) => {
        const debounce = (func: (...args: unknown[]) => void, ms = 1000) => {
          let timeout: NodeJS.Timeout
          console.log(`Debouncing in  ${ms}`)
          return (...args: unknown[]) => {
            console.log('in debounce, clearing timeout again')
            clearTimeout(timeout)
            timeout = setTimeout(() => {
              func.apply(this, args)
            }, ms)
          }
        }
        return new Promise<void>((resolve) => {
          const mainTimeout = setTimeout(() => {
            observer.disconnect()
            console.log(
              'Timed out whilst waiting for DOM to settle. Using what we have.'
            )
            resolve()
          }, timeoutMs)

          const debouncedResolve = debounce(() => {
            observer.disconnect()
            clearTimeout(mainTimeout)
            resolve()
          }, debounceMs)

          const observer = new MutationObserver(() => {
            debouncedResolve()
          })

          const config = {
            attributes: true,
            childList: true,
            subtree: true,
          }

          observer.observe(document.body, config)
        })
      },
      timeoutMs,
      debounceMs
    )

  private async retrievePage(
    url: string,
    logRecord: Record<string, any>,
    functionStartTime: number,
    locale?: string,
    timezone?: string
  ) {
    this.validateUrlStringStrict(url)

    logRecord.timing = {
      ...logRecord.timing,
      browserOpened: Date.now() - functionStartTime,
    }

    // Use persistent context for session management (cookies, etc.)
    const context = await this.getPersistentContext()

    // Add human-like delay before navigation (100-500ms)
    const humanDelay = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, humanDelay))

    // Puppeteer fails during download of PDF files,
    // so record the failure and use those items
    let lastPdfUrl
    try {
      const page = await context.newPage()

      // Set realistic user agent and headers from fingerprint
      if (this.currentFingerprint) {
        const userAgent =
          this.currentFingerprint.headers?.['user-agent'] ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'

        await page.setUserAgent(userAgent)

        const realisticHeaders = {
          Accept:
            this.currentFingerprint.headers?.accept ||
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language':
            locale ||
            this.currentFingerprint.headers?.['accept-language'] ||
            'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          DNT: '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        }

        await page.setExtraHTTPHeaders(realisticHeaders)
        this.logger.info('Set realistic browser headers', {
          userAgent,
        })
      }

      if (!this.enableJavascriptForUrl(url)) {
        await page.setJavaScriptEnabled(false)
      }

      // Set timezone and network interception (Chrome/Chromium only)
      if (process.env['USE_FIREFOX'] !== 'true') {
        try {
          if (timezone) {
            await page.emulateTimezone(timezone)
          }

          const client = await page.createCDPSession()

          const downloadPath = path.resolve('./download_dir/')
          await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath,
          })

          // Intercept request when response headers was received
          await client.send('Network.setRequestInterception', {
            patterns: [
              {
                urlPattern: '*',
                resourceType: 'Document',
                interceptionStage: 'HeadersReceived',
              },
            ],
          })

          client.on(
            'Network.requestIntercepted',
            (e: Protocol.Network.RequestInterceptedEvent) => {
              ;(async () => {
                try {
                  const headers = e.responseHeaders || {}

                  const [contentType] = (
                    headers['content-type'] ||
                    headers['Content-Type'] ||
                    ''
                  )
                    .toLowerCase()
                    .split(';')
                  const obj: Protocol.Network.ContinueInterceptedRequestRequest =
                    {
                      interceptionId: e.interceptionId,
                    }

                  if (
                    e.responseStatusCode &&
                    e.responseStatusCode >= 200 &&
                    e.responseStatusCode < 300
                  ) {
                    // We only check content-type on success responses
                    // as it doesn't matter what the content type is for things
                    // like redirects
                    if (
                      contentType &&
                      !this.ALLOWED_CONTENT_TYPES.includes(contentType)
                    ) {
                      obj['errorReason'] = 'BlockedByClient'
                    }
                  }

                  await client.send('Network.continueInterceptedRequest', obj)
                } catch (error) {
                  // Ignore CDP protocol errors - they're common and don't affect extraction
                  this.logger.debug(
                    'CDP network interception error (ignored)',
                    {
                      error:
                        error instanceof Error
                          ? error.message
                          : 'Unknown error',
                    }
                  )
                }
              })().catch((error) => {
                // Catch any unhandled promise rejections from CDP operations
                this.logger.debug('CDP async operation error (ignored)', {
                  error:
                    error instanceof Error ? error.message : 'Unknown error',
                })
              })
            }
          )
        } catch (error) {
          this.logger.info(
            'CDP setup failed, continuing without network interception',
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          )
        }
      } else {
        this.logger.info(
          'Using Firefox - CDP network interception not available'
        )
      }

      /*
       * Disallow MathJax from running in Puppeteer and modifying the document,
       * we shall instead run it in our frontend application to transform any
       * mathjax content when present.
       */

      let requestCount = 0
      const failedRequests = new Set()
      page.removeAllListeners('request')
      page.on('request', (request) => {
        // Use immediate promise handling to prevent "Request is already handled" errors
        Promise.resolve()
          .then(async () => {
            try {
              if (request.isInterceptResolutionHandled()) return

              const url = request.url().toLowerCase()

              // Block unnecessary resources for faster loading and cleaner content
              if (
                url.includes('.woff2') ||
                url.includes('.woff') ||
                url.includes('.ttf')
              ) {
                return await request.abort().catch(() => {})
              }

              if (requestCount++ > 100) {
                return await request.abort().catch(() => {})
              }

              if (failedRequests.has(request.url())) {
                return await request.abort().catch(() => {})
              }

              if (
                url.includes('mathjax') ||
                url.includes('googlesyndication') ||
                url.includes('googletagmanager') ||
                url.includes('facebook.net') ||
                url.includes('twitter.com/widgets') ||
                url.includes('analytics')
              ) {
                return await request.abort().catch(() => {})
              }

              await request.continue().catch(() => {})
            } catch (error) {
              // Silently handle request interception errors
            }
          })
          .catch(() => {
            // Prevent unhandled promise rejections
          })
      })
      await page.setRequestInterception(true)

      page.on('response', (response) => {
        if (!response.ok()) {
          this.logger.error('Failed request', { url: response.url() })
          failedRequests.add(response.url())
        }

        if (response.headers()['content-type'] === 'application/pdf') {
          lastPdfUrl = response.url()
        }
      })

      // Determine optimal timeout and strategy based on site
      const siteStrategy = this.getSiteStrategy(url)

      this.logger.info(`Loading page with ${siteStrategy.strategy} strategy`, {
        timeout: siteStrategy.timeout,
        waitUntil: siteStrategy.waitUntil,
      })

      const response = await page
        .goto(url, {
          timeout: siteStrategy.timeout,
          waitUntil: siteStrategy.waitUntil,
        })
        .catch(async (error) => {
          // Use our error classifier for better error handling
          const classifiedError = this.errorClassifier.classify(error, url)

          this.logger.error('Navigation failed', {
            url,
            category: classifiedError.category,
            severity: classifiedError.severity,
            retryable: classifiedError.retryable,
            error: error.message.substring(0, 100),
          })

          // DNS errors are permanent - fail immediately
          if (classifiedError.category === 'dns') {
            throw new Error(`DNS resolution failed: ${error.message}`)
          }

          // SSL errors - fail fast (HTTP fallback will be handled at higher level)
          if (classifiedError.category === 'ssl') {
            throw new Error(`SSL certificate error: ${error.message}`)
          }

          // Only retry timeout errors with progressive fallback
          if (
            classifiedError.category === 'timeout' &&
            classifiedError.retryable
          ) {
            this.logger.info(
              'Navigation timeout - trying with minimal requirements',
              {
                url,
                error: error.message.substring(0, 100),
              }
            )

            return await page
              .goto(url, {
                timeout: 15 * 1000, // Shorter timeout
                waitUntil: ['domcontentloaded'], // Minimal wait requirement
              })
              .catch(async (secondError) => {
                // Final attempt with networkidle0 for slow sites
                this.logger.info('Trying final attempt with networkidle0', {
                  url,
                  secondError: secondError.message.substring(0, 100),
                })

                return await page.goto(url, {
                  timeout: 10 * 1000,
                  waitUntil: ['networkidle0'],
                })
              })
          }

          throw error // Re-throw non-retriable errors
        })

      this.logger.info(
        'Waited for content to load, dismissing popups and waiting for DOM to settle.'
      )

      // Dismiss popups using generic semantic detection
      await this.dismissPopupsGeneric(page)

      // Additional aggressive popup removal after page load
      await this.removePopupsFromDOM(page)

      await this.waitForDOMToSettle(page)

      if (!response) {
        throw new Error('No response from page')
      }

      const finalUrl = response.url()
      const contentType = response.headers()['content-type']

      logRecord.finalUrl = finalUrl
      logRecord.contentType = contentType

      return { page, finalUrl, contentType, context }
    } catch (error) {
      if (lastPdfUrl) {
        return {
          context,
          finalUrl: lastPdfUrl,
          contentType: 'application/pdf',
        }
      }
      // Don't close persistent context on error - let it persist for session management
      throw error
    }
  }

  private async retrieveHtml(page: Page, logRecord: Record<string, any>) {
    let domContent, title
    try {
      title = await page.title()
      logRecord.title = title

      await page.waitForSelector('body')

      const pageScrollingStart = Date.now()
      /* scroll with a 5 seconds timeout */
      try {
        await Promise.race([
          page.evaluate(
            `(async () => {
                /* credit: https://github.com/puppeteer/puppeteer/issues/305 */
                return new Promise((resolve, reject) => {
                  let scrollHeight = document.body.scrollHeight;
                  let totalHeight = 0;
                  let distance = 500;
                  let timer = setInterval(() => {
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if(totalHeight >= scrollHeight){
                      clearInterval(timer);
                      resolve(true);
                    }
                  }, 10);
                });
              })()`
          ),
          new Promise((r) => setTimeout(r, 5000)),
        ])
      } catch (error) {
        this.logger.error('Error scrolling page', error)
        logRecord.scrollError = true
      }

      logRecord.timing = {
        ...logRecord.timing,
        pageScrolled: Date.now() - pageScrollingStart,
      }

      const iframes: Record<string, any> = {}
      const urls: string[] = []
      const framesPromises = []
      const allowedUrls = /instagram\.com/gi

      for (const frame of page.mainFrame().childFrames()) {
        if (frame.url() && allowedUrls.test(frame.url())) {
          urls.push(frame.url())
          framesPromises.push(
            frame.evaluate((el) => el?.innerHTML, await frame.$('body'))
          )
        }
      }

      ;(await Promise.all(framesPromises)).forEach(
        (frame, index) => (iframes[urls[index]] = frame)
      )

      const domContentCapturingStart = Date.now()
      // get document body with all hidden elements removed
      domContent = await page.evaluate((iframes) => {
        const BI_SRC_REGEXP = /url\("(.+?)"\)/gi

        Array.from(document.body.getElementsByTagName('*')).forEach((el) => {
          const style = window.getComputedStyle(el)
          const src = el.getAttribute('src')

          try {
            // Removing blurred images since they are mostly the copies of lazy loaded ones
            if (
              el.tagName &&
              ['img', 'image'].includes(el.tagName.toLowerCase())
            ) {
              const filter = style.getPropertyValue('filter')
              if (filter && filter.startsWith('blur')) {
                el.parentNode && el.parentNode.removeChild(el)
              }
            }
          } catch (err) {
            // ignore
          }

          // convert all nodes with background image to img nodes
          if (
            !['', 'none'].includes(style.getPropertyValue('background-image'))
          ) {
            const filter = style.getPropertyValue('filter')
            // avoiding image nodes with a blur effect creation
            if (filter && filter.startsWith('blur')) {
              el && el.parentNode && el.parentNode.removeChild(el)
            } else {
              const matchedSRC = BI_SRC_REGEXP.exec(
                style.getPropertyValue('background-image')
              )
              // Using "g" flag with a regex we have to manually break down lastIndex to zero after every usage
              // More details here: https://stackoverflow.com/questions/1520800/why-does-a-regexp-with-global-flag-give-wrong-results
              BI_SRC_REGEXP.lastIndex = 0

              if (matchedSRC && matchedSRC[1] && !src) {
                // Replacing element only of there are no content inside, b/c might remove important div with content.
                // Article example: http://www.josiahzayner.com/2017/01/genetic-designer-part-i.html
                // DIV with class "content-inner" has `url("https://resources.blogblog.com/blogblog/data/1kt/travel/bg_container.png")` background image.
                if (!el.textContent) {
                  const img = document.createElement('img')
                  img.src = matchedSRC[1]
                  el && el.parentNode && el.parentNode.replaceChild(img, el)
                }
              }
            }
          }

          if (el.tagName === 'IFRAME') {
            if (src && iframes[src]) {
              const newNode = document.createElement('div')
              newNode.className = 'omnivore-instagram-embed'
              newNode.innerHTML = iframes[src]
              el && el.parentNode && el.parentNode.replaceChild(newNode, el)
            }
          }
        })

        if (
          document.querySelector('[data-translate="managed_checking_msg"]') ||
          document.getElementById('px-block-form-wrapper')
        ) {
          return 'IS_BLOCKED'
        }

        return document.documentElement.outerHTML
      }, iframes)
      logRecord.puppeteerSuccess = true
      logRecord.timing = {
        ...logRecord.timing,
        contenCaptured: Date.now() - domContentCapturingStart,
      }
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.startsWith('net::ERR_BLOCKED_BY_CLIENT at ')) {
          logRecord.blockedByClient = true
        } else {
          logRecord.puppeteerSuccess = false
          logRecord.puppeteerError = {
            message: e.message,
            stack: e.stack,
          }
        }
      } else {
        logRecord.puppeteerSuccess = false
        logRecord.puppeteerError = e
      }

      throw e
    }

    if (domContent === 'IS_BLOCKED') {
      logRecord.blockedByClient = true
      throw new Error('Page is blocked')
    }

    return { domContent, title }
  }

  public getStatus() {
    return {
      isRunning: this.isRunning(),
      queueName: CONTENT_QUEUE_NAME,
      concurrency: this.worker.concurrency,
    }
  }

  private setupEventHandlers(): void {
    this.worker.on(
      'completed',
      (job: Job<ContentSaveRequestedEvent>, result: boolean) => {
        this.logger.info(
          `${job.id} ${job.data.data.libraryItemId} ${result}`,
          'Content job completed'
        )
      }
    )

    this.worker.on(
      'failed',
      (job: Job<ContentSaveRequestedEvent> | undefined, error: Error) => {
        this.logger.error(
          `${job?.id} ${job?.data.data.libraryItemId} ${error.message}`,
          'Content job failed'
        )
      }
    )

    this.worker.on('error', (error: Error) => {
      this.logger.error(`${error.message}`, 'Content worker error')
    })
  }

  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down content worker')
    await this.worker.close()
    this.logger.info('Content worker shut down')
  }

  public isRunning(): boolean {
    return this.worker.isRunning()
  }

  public async start(): Promise<void> {
    // Worker already starts automatically in constructor
    this.logger.info('Content worker start requested - already running')
  }

  public async stop(): Promise<void> {
    await this.shutdown()
  }
}

class ContentProcessingStartedEvent implements BaseEvent {
  public readonly eventType = 'CONTENT_PROCESSING_STARTED' as const

  constructor(public data: ContentProcessingStartedEventData) {
    this.validate()
  }

  serialize(): string {
    return JSON.stringify({
      eventType: this.eventType,
      timestamp: new Date().toISOString(),
      ...this.data,
    })
  }

  protected validate(): void {
    if (!this.data.libraryItemId) throw new Error('libraryItemId required')
    if (!this.data.userId) throw new Error('userId required')
  }
}

class ContentProcessingCompletedEvent implements BaseEvent {
  public readonly eventType = 'CONTENT_PROCESSING_COMPLETED' as const

  constructor(public data: ContentProcessingCompletedEventData) {
    this.validate()
  }

  serialize(): string {
    return JSON.stringify({
      eventType: this.eventType,
      timestamp: new Date().toISOString(),
      ...this.data,
    })
  }

  protected validate(): void {
    if (!this.data.libraryItemId) throw new Error('libraryItemId required')
    if (!this.data.userId) throw new Error('userId required')
  }
}

class ContentProcessingFailedEvent implements BaseEvent {
  public readonly eventType = 'CONTENT_PROCESSING_FAILED' as const

  constructor(public data: ContentProcessingFailedEventData) {
    this.validate()
  }

  serialize(): string {
    return JSON.stringify({
      eventType: this.eventType,
      timestamp: new Date().toISOString(),
      ...this.data,
    })
  }

  protected validate(): void {
    if (!this.data.libraryItemId) throw new Error('libraryItemId required')
    if (!this.data.userId) throw new Error('userId required')
    if (!this.data.error) throw new Error('error required')
  }
}
