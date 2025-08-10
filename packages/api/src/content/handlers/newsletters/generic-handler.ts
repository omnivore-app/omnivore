/**
 * Generic Newsletter Handler
 *
 * Handles generic newsletter content and email-based articles.
 * Migrated from content-handler service.
 */

import { logger as baseLogger } from '../../../utils/logger'
import { ContentType } from '../../../events/content/content-save-event'
import { ContentHandler, RawContent, ExtractionOptions } from '../../types'

export class GenericHandler implements ContentHandler {
  public readonly name = 'generic-newsletter-handler'
  private logger = baseLogger.child({ context: 'generic-newsletter-handler' })

  /**
   * Check if this handler can process the content
   */
  canHandle(url: string, contentType: ContentType): boolean {
    // Handle email content or newsletter-like URLs
    return contentType === ContentType.EMAIL || this.isNewsletterUrl(url)
  }

  /**
   * Extract content (delegates to main extraction service)
   */
  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    this.logger.debug('Extracting generic newsletter content', { url })

    // Generic newsletters don't need special extraction logic
    // They rely on the main extraction service
    throw new Error(
      'Generic handler requires integration with extraction service'
    )
  }

  /**
   * Process extracted newsletter content
   */
  async process(content: RawContent): Promise<RawContent> {
    this.logger.debug('Processing generic newsletter content', {
      url: content.url,
    })

    try {
      const processedContent = { ...content }

      // Clean up common newsletter elements
      if (content.dom) {
        const cleanedDom = this.cleanNewsletterContent(content.dom)
        processedContent.dom = cleanedDom
        processedContent.html = cleanedDom.documentElement.outerHTML
        processedContent.text = cleanedDom.body?.textContent || content.text
      }

      // Extract newsletter metadata
      const newsletterMetadata = this.extractNewsletterMetadata(content)
      processedContent.metadata = {
        ...content.metadata,
        ...newsletterMetadata,
        processedBy: this.name,
      }

      this.logger.info('Generic newsletter content processed', {
        url: content.url,
        hasSubject: !!newsletterMetadata.subject,
        hasFrom: !!newsletterMetadata.from,
      })

      return processedContent
    } catch (error) {
      this.logger.error('Generic newsletter processing failed', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return content
    }
  }

  /**
   * Check if URL looks like a newsletter
   */
  private isNewsletterUrl(url: string): boolean {
    const newsletterPatterns = [
      /newsletter/i,
      /email/i,
      /mail/i,
      /digest/i,
      /weekly/i,
      /daily/i,
      /bulletin/i,
      /update/i,
    ]

    return newsletterPatterns.some((pattern) => pattern.test(url))
  }

  /**
   * Clean common newsletter content
   */
  private cleanNewsletterContent(dom: Document): Document {
    const clonedDom = dom.cloneNode(true) as Document

    // Remove common newsletter footer elements
    const footerSelectors = [
      '.email-footer',
      '.newsletter-footer',
      '.unsubscribe',
      '.footer',
      '[class*="footer"]',
      '[id*="footer"]',
    ]

    footerSelectors.forEach((selector) => {
      clonedDom.querySelectorAll(selector).forEach((el) => {
        // Only remove if it contains unsubscribe-related content
        const text = el.textContent?.toLowerCase() || ''
        if (
          text.includes('unsubscribe') ||
          text.includes('preferences') ||
          text.includes('manage subscription')
        ) {
          el.remove()
        }
      })
    })

    // Remove tracking pixels and analytics
    clonedDom
      .querySelectorAll('img[width="1"], img[height="1"]')
      .forEach((el) => {
        const src = el.getAttribute('src') || ''
        if (
          src.includes('track') ||
          src.includes('analytics') ||
          src.includes('pixel')
        ) {
          el.remove()
        }
      })

    // Remove social media follow buttons (but keep content)
    clonedDom
      .querySelectorAll('[class*="social"], [class*="follow"]')
      .forEach((el) => {
        const text = el.textContent?.toLowerCase() || ''
        if (
          text.includes('follow') ||
          text.includes('twitter') ||
          text.includes('facebook')
        ) {
          // Only remove if it's clearly a social media button, not content
          if (el.tagName === 'A' || el.querySelector('a')) {
            el.remove()
          }
        }
      })

    // Clean up empty elements
    clonedDom
      .querySelectorAll('p:empty, div:empty')
      .forEach((el) => el.remove())

    return clonedDom
  }

  /**
   * Extract newsletter-specific metadata
   */
  private extractNewsletterMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {
      isNewsletter: true,
      platform: 'Generic',
    }

    if (!content.dom) {
      return metadata
    }

    try {
      // Look for email headers in the content
      const subjectElement = content.dom.querySelector(
        '[class*="subject"], [id*="subject"]'
      )
      if (subjectElement) {
        metadata.subject = subjectElement.textContent?.trim()
      }

      // Look for sender information
      const fromElement = content.dom.querySelector(
        '[class*="from"], [class*="sender"]'
      )
      if (fromElement) {
        metadata.from = fromElement.textContent?.trim()
      }

      // Look for date information
      const dateElement = content.dom.querySelector(
        '[class*="date"], [class*="time"]'
      )
      if (dateElement) {
        metadata.date =
          dateElement.textContent?.trim() ||
          dateElement.getAttribute('datetime')
      }

      // Look for unsubscribe links
      const unsubscribeElement = content.dom.querySelector(
        'a[href*="unsubscribe"]'
      )
      if (unsubscribeElement) {
        metadata.unsubscribeUrl = unsubscribeElement.getAttribute('href')
      }

      // Try to extract newsletter name from title or header
      const titleElement = content.dom.querySelector(
        'title, h1, [class*="newsletter-name"]'
      )
      if (titleElement) {
        const title = titleElement.textContent?.trim()
        if (
          title &&
          !title.toLowerCase().includes('email') &&
          !title.toLowerCase().includes('newsletter')
        ) {
          metadata.newsletterName = title
        }
      }

      // Look for newsletter branding
      const logoElement = content.dom.querySelector(
        'img[alt*="logo"], img[class*="logo"]'
      )
      if (logoElement) {
        metadata.logo = logoElement.getAttribute('src')
      }
    } catch (error) {
      this.logger.warn('Failed to extract newsletter metadata', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    return metadata
  }

  /**
   * Check if content should be preprocessed
   */
  shouldPreprocess(url: string, dom?: Document): boolean {
    if (!this.canHandle(url, ContentType.EMAIL)) {
      return false
    }

    // Check for newsletter-like structure in DOM
    if (dom) {
      const newsletterIndicators = [
        '.email-body',
        '.newsletter-content',
        '[class*="newsletter"]',
        '[class*="email"]',
        'a[href*="unsubscribe"]',
      ]

      return newsletterIndicators.some((selector) =>
        dom.querySelector(selector)
      )
    }

    return true
  }

  /**
   * Get handler capabilities
   */
  getCapabilities() {
    return {
      name: this.name,
      supportedDomains: ['*'], // Generic handler supports all domains
      supportedContentTypes: [ContentType.EMAIL],
      features: {
        newsletterOptimized: true,
        genericCleaning: true,
        metadataExtraction: true,
        unsubscribeLinkDetection: true,
        trackingPixelRemoval: true,
      },
    }
  }
}
