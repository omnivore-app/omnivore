/**
 * Readability Content Extractor
 *
 * Uses simple HTTP requests and Readability.js to extract content from web pages
 * without JavaScript execution. Faster and more resource-efficient for simple content.
 */

import { parseHTML } from 'linkedom'
import { Readability } from '@mozilla/readability'
import { logger as baseLogger } from '../../utils/logger'
import {
  ContentExtractor,
  RawContent,
  ExtractionOptions,
  ContentExtractionError,
} from '../types'

export class ReadabilityExtractor implements ContentExtractor {
  public readonly name = 'readability-extractor'
  private logger = baseLogger.child({ context: 'readability-extractor' })

  /**
   * Check if this extractor can handle the given URL
   */
  canExtract(url: string, options: ExtractionOptions): boolean {
    try {
      new URL(url) // Basic URL validation

      // Don't use readability for URLs that definitely need JavaScript
      const jsRequiredPatterns = [
        /youtube\.com/i,
        /youtu\.be/i,
        /twitter\.com/i,
        /x\.com/i,
        /facebook\.com/i,
        /instagram\.com/i,
        /tiktok\.com/i,
      ]

      if (jsRequiredPatterns.some((pattern) => pattern.test(url))) {
        return false
      }

      // Don't use if custom scripts are required
      if (options.customScripts && options.customScripts.length > 0) {
        return false
      }

      // Don't use if waiting for specific selector
      if (options.waitForSelector) {
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Extract content using simple HTTP request and Readability
   */
  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    const startTime = Date.now()

    this.logger.debug('Starting Readability extraction', { url, options })

    try {
      // Fetch HTML content
      const { html, finalUrl, headers } = await this.fetchHtml(url, options)

      // Parse HTML with linkedom
      const { document } = parseHTML(html)

      // Apply Readability
      const reader = new Readability(document, {
        debug: false,
        maxElemsToParse: 1000,
        nbTopCandidates: 5,
        charThreshold: 500,
        classesToPreserve: ['highlight', 'important'],
        keepClasses: false,
        serializer: (node: Node) => node.textContent || '',
        disableJSONLD: false,
        allowedVideoRegex: /youtube|vimeo/i,
      })

      const article = reader.parse()

      if (!article) {
        throw new ContentExtractionError(
          'Readability failed to extract article content',
          url
        )
      }

      // Extract additional metadata
      const metadata = this.extractMetadata(document)

      const extractionTime = Date.now() - startTime

      this.logger.info('Readability extraction completed', {
        url,
        finalUrl,
        title: article.title,
        contentLength: article.content.length,
        textLength: article.textContent.length,
        extractionTime,
      })

      return {
        url: finalUrl,
        finalUrl,
        html: article.content,
        text: article.textContent,
        dom: document,
        contentType: headers['content-type'] || 'text/html',
        headers,
        metadata: {
          title: article.title,
          byline: article.byline,
          excerpt: article.excerpt,
          siteName: article.siteName,
          length: article.length,
          dir: article.dir,
          lang: article.lang,
          publishedTime: metadata.publishedTime,
          modifiedTime: metadata.modifiedTime,
          author: metadata.author,
          description: metadata.description,
          image: metadata.image,
          extractionTime,
          userAgent: options.userAgent,
        },
      }
    } catch (error) {
      const extractionTime = Date.now() - startTime

      this.logger.error('Readability extraction failed', {
        url,
        extractionTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      if (error instanceof ContentExtractionError) {
        throw error
      }

      throw new ContentExtractionError(
        `Readability extraction failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        url,
        undefined,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Fetch HTML content from URL
   */
  private async fetchHtml(
    url: string,
    options: ExtractionOptions
  ): Promise<{
    html: string
    finalUrl: string
    headers: Record<string, string>
  }> {
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || 30000
    )

    try {
      const headers: Record<string, string> = {
        'User-Agent':
          options.userAgent || 'Omnivore/1.0 (+https://omnivore.app)',
      }

      if (options.locale) {
        headers['Accept-Language'] = options.locale
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
        redirect: 'follow',
      })

      clearTimeout(timeoutId)

      if (!response.ok && response.status >= 400) {
        // Allow some 4xx errors that might still have content
        const allowedErrorCodes = [401, 403, 404, 429]
        if (!allowedErrorCodes.includes(response.status)) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      }

      const html = await response.text()
      const finalUrl = response.url
      const responseHeaders: Record<string, string> = {}

      // Convert Headers to plain object
      response.headers.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value
      })

      return { html, finalUrl, headers: responseHeaders }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ContentExtractionError('Request timeout', url)
      }

      throw new ContentExtractionError(
        `HTTP request failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        url
      )
    }
  }

  /**
   * Extract additional metadata from document
   */
  private extractMetadata(
    document: Document
  ): Record<string, string | undefined> {
    const getMetaContent = (name: string): string | undefined => {
      const meta = document.querySelector(
        `meta[name="${name}"], meta[property="${name}"]`
      )
      return meta?.getAttribute('content') || undefined
    }

    const getLinkHref = (rel: string): string | undefined => {
      const link = document.querySelector(`link[rel="${rel}"]`)
      return link?.getAttribute('href') || undefined
    }

    return {
      // Open Graph
      title: getMetaContent('og:title'),
      description:
        getMetaContent('og:description') || getMetaContent('description'),
      image: getMetaContent('og:image'),
      siteName: getMetaContent('og:site_name'),
      publishedTime: getMetaContent('article:published_time'),
      modifiedTime: getMetaContent('article:modified_time'),
      author: getMetaContent('article:author') || getMetaContent('author'),

      // Twitter Card
      twitterTitle: getMetaContent('twitter:title'),
      twitterDescription: getMetaContent('twitter:description'),
      twitterImage: getMetaContent('twitter:image'),
      twitterCreator: getMetaContent('twitter:creator'),

      // Schema.org JSON-LD
      jsonLd: this.extractJsonLd(document),

      // Canonical URL
      canonical: getLinkHref('canonical'),

      // RSS/Atom feeds
      rssFeed: getLinkHref('alternate'),
    }
  }

  /**
   * Extract JSON-LD structured data
   */
  private extractJsonLd(document: Document): string | undefined {
    try {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      )
      const jsonLdData: any[] = []

      scripts.forEach((script) => {
        try {
          const data = JSON.parse(script.textContent || '')
          jsonLdData.push(data)
        } catch (error) {
          // Ignore invalid JSON-LD
        }
      })

      return jsonLdData.length > 0 ? JSON.stringify(jsonLdData) : undefined
    } catch {
      return undefined
    }
  }

  /**
   * Check if URL is likely to work with Readability
   */
  isReadabilityCompatible(url: string): boolean {
    // Patterns that typically work well with Readability
    const compatiblePatterns = [
      /blog/i,
      /article/i,
      /post/i,
      /news/i,
      /story/i,
      /\/p\//i, // Medium-style paths
      /\/posts?\//i, // Blog post paths
      /\/articles?\//i, // Article paths
    ]

    // Patterns that typically don't work well
    const incompatiblePatterns = [
      /youtube\.com/i,
      /youtu\.be/i,
      /twitter\.com/i,
      /x\.com/i,
      /facebook\.com/i,
      /instagram\.com/i,
      /tiktok\.com/i,
      /reddit\.com/i,
      /\/api\//i,
      /\/app\//i,
      /\/#\//i, // Hash-based routing
    ]

    // Check incompatible first
    if (incompatiblePatterns.some((pattern) => pattern.test(url))) {
      return false
    }

    // Check compatible patterns or assume compatible for standard URLs
    return compatiblePatterns.some((pattern) => pattern.test(url)) || true
  }

  /**
   * Get extraction statistics
   */
  getStats() {
    return {
      name: this.name,
      capabilities: {
        javascript: false,
        customScripts: false,
        waitForSelector: false,
        fastExtraction: true,
        lowResourceUsage: true,
      },
    }
  }
}
