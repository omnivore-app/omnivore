/**
 * ContentProcessorService - BullMQ Worker for Content Processing
 *
 * Processes jobs from the content-processing queue to fetch and parse
 * web content for saved library items.
 */

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'
import fetch from 'cross-fetch'
import {
  LibraryItemEntity,
  LibraryItemState,
} from '../../library/entities/library-item.entity'
import { EventBusService } from '../event-bus.service'
import { EVENT_NAMES } from '../events.constants'
import { QUEUE_NAMES, JOB_TYPES, JOB_CONFIG } from '../queue.constants'

/**
 * Job data interface for fetch-content jobs
 */
export interface FetchContentJobData {
  libraryItemId: string
  url: string
  userId: string
  source?: 'web' | 'mobile' | 'api' | 'extension'
  timestamp: Date
}

/**
 * Result of content fetching operation
 */
export interface ContentFetchResult {
  success: boolean
  title?: string
  content?: string
  contentType?: string
  author?: string
  publishedDate?: Date
  siteIcon?: string
  thumbnail?: string
  description?: string
  siteName?: string
  wordCount?: number
  error?: string
}

@Injectable()
@Processor(QUEUE_NAMES.CONTENT_PROCESSING, {
  concurrency: JOB_CONFIG.WORKER_CONCURRENCY,
})
export class ContentProcessorService
  extends WorkerHost
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ContentProcessorService.name)

  constructor(
    @InjectRepository(LibraryItemEntity)
    private readonly libraryItemRepository: Repository<LibraryItemEntity>,
    private readonly eventBus: EventBusService,
  ) {
    super()
  }

  onModuleInit() {
    this.logger.log(
      `ContentProcessorService initialized with concurrency ${JOB_CONFIG.WORKER_CONCURRENCY}`,
    )
  }

  async onModuleDestroy() {
    this.logger.log('ContentProcessorService shutting down...')
    try {
      // Close the worker gracefully
      await this.worker?.close()
      this.logger.log('ContentProcessorService shut down successfully')
    } catch (error) {
      this.logger.error(
        `Error during ContentProcessorService shutdown: ${error}`,
      )
    }
  }

  /**
   * Main job processing method
   * Called by BullMQ for each job
   */
  async process(job: Job<FetchContentJobData, any, string>): Promise<any> {
    const { libraryItemId, url, userId, source } = job.data

    this.logger.log(
      `Processing job ${job.id} for item ${libraryItemId} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    )

    // Route to appropriate handler based on job name
    switch (job.name) {
      case JOB_TYPES.FETCH_CONTENT:
        return this.handleFetchContent(job)
      case JOB_TYPES.PARSE_CONTENT:
        return this.handleParseContent(job)
      default:
        throw new Error(`Unknown job type: ${job.name}`)
    }
  }

  /**
   * Handle fetch-content jobs
   */
  private async handleFetchContent(
    job: Job<FetchContentJobData>,
  ): Promise<ContentFetchResult> {
    const { libraryItemId, url, userId } = job.data
    const startTime = Date.now()

    try {
      // Emit fetch started event
      this.eventBus.emitContentFetchStarted({
        eventType: EVENT_NAMES.CONTENT_FETCH_STARTED,
        libraryItemId,
        url,
        jobId: job.id!,
        timestamp: new Date(),
      })

      // Update job progress
      await job.updateProgress(10)

      // Update library item state to PROCESSING
      await this.updateLibraryItemState(
        libraryItemId,
        LibraryItemState.PROCESSING,
      )
      await job.updateProgress(20)

      // Fetch and process content
      const result = await this.fetchContent(url, job)

      if (!result.success) {
        throw new Error(result.error || 'Content fetch failed')
      }

      await job.updateProgress(70)

      // Save content to database
      await this.saveContent(libraryItemId, result)
      await job.updateProgress(90)

      // Update library item state to SUCCEEDED
      await this.updateLibraryItemState(
        libraryItemId,
        LibraryItemState.SUCCEEDED,
      )
      await job.updateProgress(100)

      const processingTime = Date.now() - startTime

      // Emit fetch completed event
      this.eventBus.emitContentFetchCompleted({
        eventType: EVENT_NAMES.CONTENT_FETCH_COMPLETED,
        libraryItemId,
        jobId: job.id!,
        contentLength: result.content?.length || 0,
        processingTime,
        timestamp: new Date(),
      })

      this.logger.log(
        `Successfully processed job ${job.id} for item ${libraryItemId} in ${processingTime}ms`,
      )

      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      const willRetry = job.attemptsMade + 1 < (job.opts.attempts || 1)

      this.logger.error(
        `Job ${job.id} failed for item ${libraryItemId}: ${errorMessage} ` +
          `(attempt ${job.attemptsMade + 1}/${job.opts.attempts}, will retry: ${willRetry})`,
      )

      // Update library item state to FAILED if final attempt
      if (!willRetry) {
        await this.updateLibraryItemState(
          libraryItemId,
          LibraryItemState.FAILED,
        )
      }

      // Emit fetch failed event
      this.eventBus.emitContentFetchFailed({
        eventType: EVENT_NAMES.CONTENT_FETCH_FAILED,
        libraryItemId,
        jobId: job.id!,
        userId,
        error: errorMessage,
        retryCount: job.attemptsMade + 1,
        willRetry,
        timestamp: new Date(),
      })

      throw error
    }
  }

  /**
   * Handle parse-content jobs (future implementation)
   */
  private async handleParseContent(
    job: Job<FetchContentJobData>,
  ): Promise<any> {
    this.logger.log(`Parse content job ${job.id} - Not implemented yet`)
    // TODO: Implement content parsing in Phase 3
    return { success: true, message: 'Parsing not implemented yet' }
  }

  /**
   * Fetch content from URL using two-phase extraction:
   * 1. Open Graph metadata (fast preview)
   * 2. Mozilla Readability (full content)
   */
  private async fetchContent(
    url: string,
    job: Job<FetchContentJobData>,
  ): Promise<ContentFetchResult> {
    this.logger.log(`Fetching content from ${url}`)

    try {
      // Phase 1: Fetch HTML content
      this.logger.debug(`Fetching HTML from ${url}`)


      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      await job.updateProgress(40)

      // Phase 2: Parse HTML with linkedom
      this.logger.debug(`Parsing HTML for ${url}`)
      const { document } = parseHTML(html)
      await job.updateProgress(45)

      // Phase 3: Extract Open Graph metadata (fast)
      this.logger.debug(`Extracting Open Graph metadata from ${url}`)
      const ogData = this.extractOpenGraph(document, url)
      this.logger.log(`[DEBUG] Open Graph data extracted: ${JSON.stringify({ title: ogData.title, image: ogData.image, siteName: ogData.siteName })}`)
      await job.updateProgress(50)

      // Phase 4: Extract content with Readability
      this.logger.debug(`Extracting readable content from ${url}`)
      const reader = new Readability(document, {
        keepClasses: false,
        charThreshold: 500,
      })
      const article = reader.parse()
      await job.updateProgress(60)

      if (!article) {
        // Readability failed, but we can still use Open Graph data
        this.logger.warn(
          `Readability failed for ${url}, using Open Graph data only`,
        )
        const fallbackContent = ogData.description
          ? `<p>${ogData.description}</p>`
          : ''
        return {
          success: true,
          title: ogData.title || new URL(url).hostname,
          content: fallbackContent,
          contentType: 'text/html',
          author: ogData.author,
          description: ogData.description,
          thumbnail: ogData.image,
          siteName: ogData.siteName,
          siteIcon: ogData.favicon,
          publishedDate: ogData.publishedTime
            ? new Date(ogData.publishedTime)
            : undefined,
          wordCount: this.calculateWordCount(fallbackContent),
        }
      }

      // Phase 5: Calculate accurate word count from content (strips HTML)
      const actualWordCount = this.calculateWordCount(article.content || '')

      // Cross-check: Readability also provides textContent (plain text)
      // This helps verify our HTML-to-text word counting is accurate
      const readabilityTextLength = article.textContent?.length || 0
      const readabilityWordEstimate = article.textContent
        ? article.textContent.trim().split(/\s+/).filter(w => w.length > 0).length
        : 0

      // Phase 6: Combine Open Graph + Readability results
      this.logger.log(
        `Successfully extracted content from ${url}: ${actualWordCount} words ` +
        `(Readability textContent estimate: ${readabilityWordEstimate} words, text length: ${readabilityTextLength})`
      )

      const result = {
        success: true,
        title: article.title || ogData.title || 'Untitled',
        content: article.content || '',
        contentType: 'text/html',
        author: article.byline || ogData.author,
        description: article.excerpt || ogData.description,
        thumbnail: ogData.image,
        siteName: article.siteName || ogData.siteName,
        siteIcon: ogData.favicon,
        publishedDate: ogData.publishedTime
          ? new Date(ogData.publishedTime)
          : undefined,
        wordCount: actualWordCount,
      }

      this.logger.log(`[DEBUG] Content fetch result: ${JSON.stringify({ title: result.title, thumbnail: result.thumbnail, wordCount: result.wordCount })}`)
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to fetch content from ${url}: ${errorMessage}`)

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Calculate word count from HTML content
   * Parses HTML to decode entities (e.g., &nbsp;, &amp;) before counting words
   *
   * @param htmlContent - HTML content to count words from
   * @returns Actual word count
   * @internal - Public for testing purposes only, not part of public API
   */
  public calculateWordCount(htmlContent: string): number {
    if (!htmlContent) {
      this.logger.debug('[calculateWordCount] No HTML content provided')
      return 0
    }

    try {
      // Readability returns HTML fragment (DIV), not a complete document
      // Wrap it in a proper HTML structure so linkedom can parse it correctly
      const wrappedHtml = `<!DOCTYPE html><html><body>${htmlContent}</body></html>`

      // Parse HTML to decode entities and extract text content
      const { document } = parseHTML(wrappedHtml)
      const textOnly = document.body?.textContent || ''

      this.logger.debug(`[calculateWordCount] HTML length: ${htmlContent.length}, Text length: ${textOnly.length}`)

      // Remove extra whitespace and normalize
      const normalized = textOnly.replace(/\s+/g, ' ').trim()
      if (!normalized) {
        this.logger.debug('[calculateWordCount] Normalized text is empty')
        return 0
      }

      // Split by whitespace and count non-empty words
      const words = normalized.split(' ').filter((word) => word.length > 0)

      this.logger.debug(`[calculateWordCount] Word count: ${words.length}`)
      return words.length
    } catch (error) {
      this.logger.warn(`Failed to calculate word count: ${error}`)
      return 0
    }
  }

  /**
   * Extract Open Graph metadata from HTML document
   */
  private extractOpenGraph(
    document: Document,
    url: string,
  ): {
    title?: string
    description?: string
    image?: string
    siteName?: string
    author?: string
    publishedTime?: string
    favicon?: string
  } {
    const getMeta = (property: string): string | undefined => {
      const element = document.querySelector(
        `meta[property="${property}"], meta[name="${property}"]`,
      )
      return element?.getAttribute('content') || undefined
    }

    const getLink = (rel: string): string | undefined => {
      const element = document.querySelector(`link[rel="${rel}"]`)
      const href = element?.getAttribute('href')
      if (!href) return undefined

      // Convert relative URLs to absolute
      try {
        return new URL(href, url).toString()
      } catch {
        return href
      }
    }

    return {
      title: getMeta('og:title') || getMeta('twitter:title'),
      description:
        getMeta('og:description') ||
        getMeta('twitter:description') ||
        getMeta('description'),
      image: getMeta('og:image') || getMeta('twitter:image'),
      siteName: getMeta('og:site_name'),
      author: getMeta('article:author') || getMeta('author'),
      publishedTime: getMeta('article:published_time'),
      favicon: getLink('icon') || getLink('shortcut icon'),
    }
  }

  /**
   * Save processed content to database
   */
  private async saveContent(
    libraryItemId: string,
    result: ContentFetchResult,
  ): Promise<void> {
    this.logger.log(`Saving content for library item ${libraryItemId}`)

    try {
      const updateData = {
        title: result.title,
        readableContent: result.content,
        author: result.author,
        description: result.description,
        publishedAt: result.publishedDate,
        siteName: result.siteName,
        siteIcon: result.siteIcon,
        thumbnail: result.thumbnail,
        wordCount: result.wordCount,
      }

      this.logger.log(`[DEBUG] Saving to DB: ${JSON.stringify({ title: updateData.title, thumbnail: updateData.thumbnail, wordCount: updateData.wordCount })}`)
      await this.libraryItemRepository.update(libraryItemId, updateData)

      this.logger.log(`Content saved for library item ${libraryItemId}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(
        `Failed to save content for ${libraryItemId}: ${errorMessage}`,
      )
      throw error
    }
  }

  /**
   * Update library item state
   */
  private async updateLibraryItemState(
    libraryItemId: string,
    state: LibraryItemState,
  ): Promise<void> {
    try {
      await this.libraryItemRepository.update(libraryItemId, { state })
      this.logger.debug(
        `Updated library item ${libraryItemId} state to ${state}`,
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(
        `Failed to update state for ${libraryItemId}: ${errorMessage}`,
      )
      throw error
    }
  }

  /**
   * Utility: Delay for testing
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Worker event handlers
   */

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Job ${job.id} is now active`)
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`)
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number | object) {
    this.logger.debug(`Job ${job.id} progress: ${JSON.stringify(progress)}`)
  }
}
