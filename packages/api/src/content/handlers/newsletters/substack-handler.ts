/**
 * Substack Newsletter Handler
 *
 * Specialized handler for Substack newsletter content.
 * Migrated from content-handler service.
 */

import { logger as baseLogger } from '../../../utils/logger'
import { ContentType } from '../../../events/content/content-save-event'
import { ContentHandler, RawContent, ExtractionOptions } from '../../types'

export class SubstackHandler implements ContentHandler {
  public readonly name = 'substack-handler'
  public readonly urlPatterns = [/\.substack\.com/i, /substackcdn\.com/i]

  private logger = baseLogger.child({ context: 'substack-handler' })

  /**
   * Check if this handler can process the content
   */
  canHandle(url: string, contentType: ContentType): boolean {
    try {
      const parsedUrl = new URL(url)
      const hostname = parsedUrl.hostname.toLowerCase()

      // Handle Substack domains
      return (
        hostname.includes('substack.com') ||
        contentType === ContentType.EMAIL ||
        url.includes('substackcdn.com')
      )
    } catch {
      return false
    }
  }

  /**
   * Extract content using Substack-specific logic
   */
  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    this.logger.debug('Extracting Substack content', { url })

    // Use the standard extraction service but with Substack-specific options
    const substackOptions: ExtractionOptions = {
      ...options,
      waitForSelector: '.post-content, .email-body-container',
      customScripts: this.getSubstackScripts(),
    }

    // For now, we'll rely on the main extraction service
    // In a full implementation, this would have custom Substack extraction logic
    throw new Error(
      'Substack handler requires integration with extraction service'
    )
  }

  /**
   * Process extracted content with Substack-specific enhancements
   */
  async process(content: RawContent): Promise<RawContent> {
    this.logger.debug('Processing Substack content', { url: content.url })

    try {
      // Clone the content to avoid mutations
      const processedContent = { ...content }

      // Clean up Substack-specific elements
      if (content.dom) {
        const cleanedDom = this.cleanSubstackContent(content.dom)
        processedContent.dom = cleanedDom

        // Re-extract HTML and text from cleaned DOM
        processedContent.html = cleanedDom.documentElement.outerHTML
        processedContent.text = cleanedDom.body?.textContent || content.text
      }

      // Extract Substack metadata
      const substackMetadata = this.extractSubstackMetadata(content)
      processedContent.metadata = {
        ...content.metadata,
        ...substackMetadata,
        processedBy: this.name,
      }

      this.logger.info('Substack content processed', {
        url: content.url,
        hasAuthor: !!substackMetadata.author,
        hasTitle: !!substackMetadata.title,
      })

      return processedContent
    } catch (error) {
      this.logger.error('Substack content processing failed', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Return original content if processing fails
      return content
    }
  }

  /**
   * Clean Substack-specific content
   */
  private cleanSubstackContent(dom: Document): Document {
    // Clone the document to avoid mutations
    const clonedDom = dom.cloneNode(true) as Document

    // Find the main email body container
    const emailBody = clonedDom.querySelector(
      '.email-body-container, .post-content'
    )

    if (emailBody) {
      // Remove Substack header elements
      emailBody.querySelector('.header')?.remove()
      emailBody.querySelector('.preamble')?.remove()
      emailBody.querySelector('.meta-author-wrap')?.remove()

      // Remove subscription prompts
      emailBody
        .querySelectorAll('.subscription-widget-wrap')
        .forEach((el) => el.remove())
      emailBody.querySelectorAll('.paywall').forEach((el) => el.remove())

      // Remove footer elements
      emailBody.querySelector('.footer')?.remove()
      emailBody.querySelector('.email-footer')?.remove()

      // Clean up tracking pixels and analytics
      emailBody
        .querySelectorAll('img[src*="track"], img[src*="analytics"]')
        .forEach((el) => el.remove())

      // Remove empty paragraphs
      emailBody.querySelectorAll('p:empty').forEach((el) => el.remove())
    }

    return clonedDom
  }

  /**
   * Extract Substack-specific metadata
   */
  private extractSubstackMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {}

    if (!content.dom) {
      return metadata
    }

    try {
      // Extract title from Substack structure
      const titleElement = content.dom.querySelector(
        '.post-title, h1.entry-title'
      )
      if (titleElement) {
        metadata.title = titleElement.textContent?.trim()
      }

      // Extract author from Substack byline
      const authorElement = content.dom.querySelector(
        '.byline-names, .author-name'
      )
      if (authorElement) {
        metadata.author = authorElement.textContent?.trim()
      }

      // Extract publication name
      const publicationElement = content.dom.querySelector(
        '.publication-name, .newsletter-name'
      )
      if (publicationElement) {
        metadata.siteName = publicationElement.textContent?.trim()
      }

      // Extract publication date
      const dateElement = content.dom.querySelector('.post-date, .email-date')
      if (dateElement) {
        metadata.publishedTime =
          dateElement.getAttribute('datetime') ||
          dateElement.textContent?.trim()
      }

      // Extract subscriber count or other metrics
      const metricsElement = content.dom.querySelector(
        '.like-button-container, .post-meta'
      )
      if (metricsElement) {
        const likesText = metricsElement.textContent
        if (likesText?.includes('like')) {
          metadata.engagement = likesText.trim()
        }
      }

      // Check if this is a paid post
      const paywallElement = content.dom.querySelector(
        '.paywall, .subscription-widget-wrap'
      )
      if (paywallElement) {
        metadata.isPaidContent = true
      }

      // Extract newsletter-specific data
      metadata.isNewsletter = true
      metadata.platform = 'Substack'
    } catch (error) {
      this.logger.warn('Failed to extract Substack metadata', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    return metadata
  }

  /**
   * Get Substack-specific scripts for content extraction
   */
  private getSubstackScripts(): string[] {
    return [
      // Wait for content to load
      `
        if (window.location.hostname.includes('substack.com')) {
          // Wait for post content to be available
          const waitForContent = () => {
            return new Promise((resolve) => {
              const checkContent = () => {
                const content = document.querySelector('.post-content, .email-body-container');
                if (content && content.children.length > 0) {
                  resolve(true);
                } else {
                  setTimeout(checkContent, 100);
                }
              };
              checkContent();
            });
          };
          
          waitForContent();
        }
      `,

      // Remove subscription overlays
      `
        document.querySelectorAll('.paywall-overlay, .subscription-overlay').forEach(el => {
          el.style.display = 'none';
        });
      `,
    ]
  }

  /**
   * Check if URL should be preprocessed by this handler
   */
  shouldPreprocess(url: string, dom?: Document): boolean {
    if (!this.canHandle(url, ContentType.HTML)) {
      return false
    }

    // Check if DOM has Substack-specific elements
    if (dom) {
      return !!(
        dom.querySelector('.email-body-container') ||
        dom.querySelector('.post-content') ||
        dom.querySelector('.publication-name') ||
        dom.querySelector('img[src*="substack"]') ||
        dom.querySelector('img[src*="substackcdn"]')
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
      supportedDomains: ['substack.com', 'substackcdn.com'],
      supportedContentTypes: [ContentType.HTML, ContentType.EMAIL],
      features: {
        newsletterOptimized: true,
        paywallDetection: true,
        authorExtraction: true,
        publicationExtraction: true,
        contentCleaning: true,
        customScripts: true,
      },
    }
  }
}
