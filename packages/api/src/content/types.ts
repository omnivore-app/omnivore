/**
 * Type definitions for the unified content processing system
 */

import { ContentType } from '../events/content/content-save-event'

export interface ContentMetadata {
  locale?: string
  timezone?: string
  labels?: string[]
  folder?: string
  source: string
  savedAt: string
  publishedAt?: string
  userId?: string
  libraryItemId?: string
}

export interface RawContent {
  url: string
  finalUrl?: string
  html?: string
  text?: string
  dom?: Document
  contentType?: string
  headers?: Record<string, string>
  metadata?: Record<string, any>
}

export interface ExtractionOptions {
  locale?: string
  timezone?: string
  enableJavaScript?: boolean
  timeout?: number
  userAgent?: string
  waitForSelector?: string
  customScripts?: string[]
  viewport?: {
    width: number
    height: number
    deviceScaleFactor?: number
  }
}

export interface ProcessingContext {
  url: string
  contentType: ContentType
  options: ExtractionOptions
  metadata?: ContentMetadata
}

export interface ContentProcessorResult {
  title?: string
  author?: string
  description?: string
  content: string
  wordCount?: number
  siteName?: string
  siteIcon?: string
  thumbnail?: string
  itemType?: string
  contentHash?: string
  publishedAt?: Date
  language?: string
  directionality?: 'LTR' | 'RTL'
  uploadFileId?: string
  finalUrl?: string
  extractedMetadata?: Record<string, any>
}

export interface ContentStats {
  totalProcessed: number
  successfulProcessing: number
  failedProcessing: number
  averageProcessingTime: number
  cacheHitRate: number
  processingByType: Record<ContentType, number>
}

export interface CacheKey {
  url: string
  contentType: ContentType
  options: string // serialized options
}

export interface CachedContent {
  key: CacheKey
  content: RawContent
  processedResult?: ContentProcessorResult
  timestamp: Date
  ttl: number
}

export interface HandlerCapability {
  canHandle: (url: string, contentType?: ContentType) => boolean
  priority: number // Lower number = higher priority
  name: string
}

export interface ProcessingStats {
  startTime: number
  endTime?: number
  duration?: number
  cacheHit: boolean
  extractionMethod: 'puppeteer' | 'readability' | 'specialized' | 'cached'
  errors?: string[]
  warnings?: string[]
}

// Error types
export class ContentProcessingError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly contentType?: ContentType,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'ContentProcessingError'
  }
}

export class ContentExtractionError extends ContentProcessingError {
  constructor(
    message: string,
    url: string,
    contentType?: ContentType,
    cause?: Error
  ) {
    super(message, url, contentType, cause)
    this.name = 'ContentExtractionError'
  }
}

export class ContentValidationError extends ContentProcessingError {
  constructor(message: string, url: string, contentType?: ContentType) {
    super(message, url, contentType)
    this.name = 'ContentValidationError'
  }
}

export class ContentHandlerError extends ContentProcessingError {
  constructor(
    message: string,
    url: string,
    contentType?: ContentType,
    cause?: Error
  ) {
    super(message, url, contentType, cause)
    this.name = 'ContentHandlerError'
  }
}

export enum DirectionalityType {
  LTR = 'LTR',
  RTL = 'RTL',
}

// Handler interfaces
export interface ContentHandler {
  readonly name: string
  readonly urlPatterns?: RegExp[]

  canHandle(url: string, contentType: ContentType): boolean
  extract(url: string, options?: ExtractionOptions): Promise<RawContent>
  process(content: RawContent): Promise<RawContent>
  shouldPreprocess?(url: string, dom?: Document): boolean
  getCapabilities?(): Record<string, any>
}

export interface ContentProcessor {
  readonly contentType: ContentType

  canProcess(contentType: ContentType, url: string): boolean
  process(
    content: RawContent,
    metadata: ContentMetadata
  ): Promise<ContentProcessorResult>
}

export interface ContentExtractor {
  readonly name: string

  canExtract(url: string, options: ExtractionOptions): boolean
  extract(url: string, options: ExtractionOptions): Promise<RawContent>
}
