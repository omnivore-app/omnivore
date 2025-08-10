/**
 * Content Enrichment Service
 *
 * Enhances processed content with additional metadata, thumbnails,
 * and other enrichment features.
 */

import { createHash } from 'crypto'
import { logger as baseLogger } from '../../utils/logger'
import { ContentType } from '../../events/content/content-save-event'
import { ContentProcessorResult, DirectionalityType } from '../types'

export class ContentEnrichmentService {
  private logger = baseLogger.child({ context: 'content-enrichment-service' })

  /**
   * Enrich processed content with additional metadata and features
   */
  async enrich(
    result: ContentProcessorResult,
    context: { url: string; contentType: ContentType }
  ): Promise<ContentProcessorResult> {
    const startTime = Date.now()

    try {
      const enrichedResult = { ...result }

      // Generate content hash if not present
      if (!enrichedResult.contentHash) {
        enrichedResult.contentHash = this.generateContentHash(
          enrichedResult.content
        )
      }

      // Detect text directionality if not set
      if (!enrichedResult.directionality) {
        enrichedResult.directionality = this.detectTextDirection(
          enrichedResult.content
        )
      }

      // Calculate word count if not present
      if (!enrichedResult.wordCount) {
        enrichedResult.wordCount = this.calculateWordCount(
          enrichedResult.content
        )
      }

      // Clean and validate title
      if (enrichedResult.title) {
        enrichedResult.title = this.cleanTitle(enrichedResult.title)
      }

      // Clean and validate author
      if (enrichedResult.author) {
        enrichedResult.author = this.cleanAuthor(enrichedResult.author)
      }

      // Clean and validate description
      if (enrichedResult.description) {
        enrichedResult.description = this.cleanDescription(
          enrichedResult.description
        )
      }

      // Extract or validate site name
      if (!enrichedResult.siteName) {
        enrichedResult.siteName = this.extractSiteNameFromUrl(context.url)
      }

      // Set final URL if not present
      if (!enrichedResult.finalUrl) {
        enrichedResult.finalUrl = context.url
      }

      // Detect language if not present
      if (!enrichedResult.language) {
        enrichedResult.language = this.detectLanguage(enrichedResult.content)
      }

      // Generate thumbnail if not present and content allows
      if (
        !enrichedResult.thumbnail &&
        this.shouldGenerateThumbnail(context.contentType)
      ) {
        enrichedResult.thumbnail = await this.generateThumbnail(
          enrichedResult,
          context
        )
      }

      const processingTime = Date.now() - startTime
      this.logger.debug('Content enriched', {
        url: context.url,
        contentType: context.contentType,
        processingTime,
        hasTitle: !!enrichedResult.title,
        hasAuthor: !!enrichedResult.author,
        hasDescription: !!enrichedResult.description,
        hasThumbnail: !!enrichedResult.thumbnail,
        wordCount: enrichedResult.wordCount,
        language: enrichedResult.language,
        directionality: enrichedResult.directionality,
      })

      return enrichedResult
    } catch (error) {
      const processingTime = Date.now() - startTime
      this.logger.error('Content enrichment failed', {
        url: context.url,
        contentType: context.contentType,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Return original result if enrichment fails
      return result
    }
  }

  /**
   * Generate content hash for deduplication
   */
  private generateContentHash(content: string): string {
    // Normalize content for hashing (remove extra whitespace, etc.)
    const normalizedContent = content.replace(/\s+/g, ' ').trim().toLowerCase()

    return createHash('sha256').update(normalizedContent).digest('hex')
  }

  /**
   * Detect text direction (LTR/RTL)
   */
  private detectTextDirection(content: string): DirectionalityType {
    // Simple RTL detection based on common RTL characters
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF]/

    // Check first 500 characters for RTL content
    const sample = content.substring(0, 500)
    const rtlMatches = sample.match(rtlRegex)

    if (rtlMatches && rtlMatches.length > 10) {
      return DirectionalityType.RTL
    }

    return DirectionalityType.LTR
  }

  /**
   * Calculate word count
   */
  private calculateWordCount(content: string): number {
    if (!content || content.trim().length === 0) {
      return 0
    }

    // Remove HTML tags and normalize whitespace
    const textContent = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!textContent) {
      return 0
    }

    // Split by whitespace and filter out empty strings
    const words = textContent.split(/\s+/).filter((word) => word.length > 0)
    return words.length
  }

  /**
   * Clean and normalize title
   */
  private cleanTitle(title: string): string {
    return title.replace(/\s+/g, ' ').trim().substring(0, 500) // Limit title length
  }

  /**
   * Clean and normalize author
   */
  private cleanAuthor(author: string): string {
    return author
      .replace(/\s+/g, ' ')
      .replace(/^by\s+/i, '') // Remove "by" prefix
      .trim()
      .substring(0, 200) // Limit author length
  }

  /**
   * Clean and normalize description
   */
  private cleanDescription(description: string): string {
    return description.replace(/\s+/g, ' ').trim().substring(0, 1000) // Limit description length
  }

  /**
   * Extract site name from URL
   */
  private extractSiteNameFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.hostname.replace(/^www\./, '')
    } catch {
      return 'Unknown Site'
    }
  }

  /**
   * Detect content language (simplified implementation)
   */
  private detectLanguage(content: string): string {
    // This is a simplified implementation
    // In a real system, you might use a language detection library

    const sample = content.substring(0, 1000).toLowerCase()

    // Simple pattern matching for common languages
    const patterns = {
      en: /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/g,
      es: /\b(el|la|los|las|y|o|pero|en|con|por|para|de)\b/g,
      fr: /\b(le|la|les|et|ou|mais|dans|sur|avec|par|pour|de)\b/g,
      de: /\b(der|die|das|und|oder|aber|in|auf|mit|von|für)\b/g,
      it: /\b(il|la|lo|gli|le|e|o|ma|in|su|con|da|per|di)\b/g,
      pt: /\b(o|a|os|as|e|ou|mas|em|sobre|com|por|para|de)\b/g,
    }

    let bestMatch = 'en'
    let maxMatches = 0

    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = sample.match(pattern)
      const matchCount = matches ? matches.length : 0

      if (matchCount > maxMatches) {
        maxMatches = matchCount
        bestMatch = lang
      }
    }

    return bestMatch
  }

  /**
   * Check if thumbnail should be generated for content type
   */
  private shouldGenerateThumbnail(contentType: ContentType): boolean {
    // Only generate thumbnails for HTML content for now
    return contentType === ContentType.HTML
  }

  /**
   * Generate thumbnail for content
   */
  private async generateThumbnail(
    result: ContentProcessorResult,
    context: { url: string; contentType: ContentType }
  ): Promise<string | undefined> {
    try {
      // This would integrate with thumbnail generation service
      // For now, try to extract from content or use a placeholder

      const imageMatch = result.content.match(/<img[^>]+src="([^"]+)"[^>]*>/i)
      if (imageMatch && imageMatch[1]) {
        const imageUrl = imageMatch[1]

        // Validate and normalize image URL
        try {
          const absoluteUrl = new URL(imageUrl, context.url).href
          this.logger.debug('Extracted thumbnail from content', {
            url: context.url,
            thumbnail: absoluteUrl,
          })
          return absoluteUrl
        } catch {
          // Invalid image URL
        }
      }

      // Could also check for Open Graph images, Twitter cards, etc.
      const ogImageMatch = result.content.match(
        /<meta[^>]+property="og:image"[^>]+content="([^"]+)"[^>]*>/i
      )
      if (ogImageMatch && ogImageMatch[1]) {
        try {
          const absoluteUrl = new URL(ogImageMatch[1], context.url).href
          this.logger.debug('Extracted Open Graph thumbnail', {
            url: context.url,
            thumbnail: absoluteUrl,
          })
          return absoluteUrl
        } catch {
          // Invalid OG image URL
        }
      }

      return undefined
    } catch (error) {
      this.logger.debug('Thumbnail generation failed', {
        url: context.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return undefined
    }
  }
}
