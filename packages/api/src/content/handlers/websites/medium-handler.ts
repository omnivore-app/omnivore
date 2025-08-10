/**
 * Medium Content Handler
 *
 * Specialized handler for Medium articles with paywall detection and content optimization.
 * Migrated from content-handler service.
 */

import { logger as baseLogger } from '../../../utils/logger'
import { ContentType } from '../../../events/content/content-save-event'
import { ContentHandler, RawContent, ExtractionOptions } from '../../types'

export class MediumHandler implements ContentHandler {
  public readonly name = 'medium-handler'
  public readonly urlPatterns = [/medium\.com/i, /.*\.medium\.com/i]

  private logger = baseLogger.child({ context: 'medium-handler' })

  /**
   * Check if this handler can process the content
   */
  canHandle(url: string, contentType: ContentType): boolean {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.hostname.includes('medium.com')
    } catch {
      return false
    }
  }

  /**
   * Extract content using Medium-specific logic
   */
  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    this.logger.debug('Extracting Medium content', { url })

    // Medium-specific extraction options
    const mediumOptions: ExtractionOptions = {
      ...options,
      waitForSelector: 'article, [data-testid="storyContent"]',
      customScripts: this.getMediumScripts(),
    }

    throw new Error(
      'Medium handler requires integration with extraction service'
    )
  }

  /**
   * Process extracted content with Medium-specific enhancements
   */
  async process(content: RawContent): Promise<RawContent> {
    this.logger.debug('Processing Medium content', { url: content.url })

    try {
      const processedContent = { ...content }

      // Clean up Medium-specific elements
      if (content.dom) {
        const cleanedDom = this.cleanMediumContent(content.dom)
        processedContent.dom = cleanedDom
        processedContent.html = cleanedDom.documentElement.outerHTML
        processedContent.text = cleanedDom.body?.textContent || content.text
      }

      // Extract Medium metadata
      const mediumMetadata = this.extractMediumMetadata(content)
      processedContent.metadata = {
        ...content.metadata,
        ...mediumMetadata,
        processedBy: this.name,
      }

      this.logger.info('Medium content processed', {
        url: content.url,
        hasAuthor: !!mediumMetadata.author,
        hasClaps: !!mediumMetadata.claps,
        isPaid: mediumMetadata.isPaidContent,
      })

      return processedContent
    } catch (error) {
      this.logger.error('Medium content processing failed', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return content
    }
  }

  /**
   * Clean Medium-specific content
   */
  private cleanMediumContent(dom: Document): Document {
    const clonedDom = dom.cloneNode(true) as Document

    // Remove Medium-specific UI elements
    const elementsToRemove = [
      // Navigation and header
      '[data-testid="headerNavigation"]',
      '.metabar',
      '.js-stickyNav',

      // Sidebars and recommendations
      '[data-testid="storyAside"]',
      '.js-postSidebar',
      '.js-sidebarStory',

      // Footer and related content
      '[data-testid="storyFooter"]',
      '.js-postFooter',
      '.js-relatedStories',

      // Paywall and membership prompts
      '[data-testid="paywall"]',
      '.js-membershipPaywall',
      '.js-signInPrompt',

      // Social sharing and clap buttons
      '[data-testid="storyActions"]',
      '.js-actionMultirecommend',
      '.js-multirecommendCountButton',

      // Comments section
      '[data-testid="storyComments"]',
      '.js-postComments',
    ]

    elementsToRemove.forEach((selector) => {
      clonedDom.querySelectorAll(selector).forEach((el) => el.remove())
    })

    // Fix Medium's picture elements for better image display
    this.fixMediumImages(clonedDom)

    // Clean up empty paragraphs and divs
    clonedDom
      .querySelectorAll('p:empty, div:empty')
      .forEach((el) => el.remove())

    return clonedDom
  }

  /**
   * Fix Medium's complex picture/img structure
   */
  private fixMediumImages(dom: Document): void {
    const pictures = dom.querySelectorAll('picture')

    pictures.forEach((picture) => {
      const source = picture.querySelector('source')
      if (source) {
        const srcSet = source.getAttribute('srcset')

        if (srcSet) {
          // Parse srcset to find the best quality image
          const sources = srcSet
            .split(', ')
            .map((src) => {
              const parts = src.trim().split(' ')
              return {
                url: parts[0],
                width: parts[1] ? parseInt(parts[1].replace('w', ''), 10) : 0,
              }
            })
            .sort((a, b) => b.width - a.width) // Sort by width descending

          if (sources.length > 0) {
            // Create a simple img element with the highest quality source
            const img = dom.createElement('img')
            img.src = sources[0].url
            img.alt = picture.querySelector('img')?.alt || ''

            // Preserve any existing styling
            const existingImg = picture.querySelector('img')
            if (existingImg) {
              const style = existingImg.getAttribute('style')
              if (style) {
                img.setAttribute('style', style)
              }
            }

            // Replace the picture element with the img
            picture.parentNode?.replaceChild(img, picture)
          }
        }
      }
    })
  }

  /**
   * Extract Medium-specific metadata
   */
  private extractMediumMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {
      platform: 'Medium',
    }

    if (!content.dom) {
      return metadata
    }

    try {
      // Extract author information
      const authorElement = content.dom.querySelector(
        '[data-testid="authorName"], .js-authorName'
      )
      if (authorElement) {
        metadata.author = authorElement.textContent?.trim()
      }

      // Extract publication information
      const publicationElement = content.dom.querySelector(
        '[data-testid="publicationName"]'
      )
      if (publicationElement) {
        metadata.publication = publicationElement.textContent?.trim()
      }

      // Extract read time
      const readTimeElement = content.dom.querySelector(
        '[data-testid="storyReadTime"]'
      )
      if (readTimeElement) {
        metadata.readTime = readTimeElement.textContent?.trim()
      }

      // Extract clap count
      const clapElement = content.dom.querySelector('[data-testid="clapCount"]')
      if (clapElement) {
        metadata.claps = clapElement.textContent?.trim()
      }

      // Extract publish date
      const dateElement = content.dom.querySelector(
        '[data-testid="storyPublishDate"], time'
      )
      if (dateElement) {
        metadata.publishedTime =
          dateElement.getAttribute('datetime') ||
          dateElement.textContent?.trim()
      }

      // Check for member-only content
      const memberOnlyElement = content.dom.querySelector(
        '[data-testid="memberOnlyStory"]'
      )
      if (memberOnlyElement) {
        metadata.isPaidContent = true
        metadata.membershipRequired = true
      }

      // Extract tags
      const tagElements = content.dom.querySelectorAll(
        '[data-testid="storyTag"]'
      )
      if (tagElements.length > 0) {
        metadata.tags = Array.from(tagElements)
          .map((tag) => tag.textContent?.trim())
          .filter(Boolean)
      }

      // Extract subtitle/description
      const subtitleElement = content.dom.querySelector(
        '[data-testid="storySubtitle"]'
      )
      if (subtitleElement) {
        metadata.subtitle = subtitleElement.textContent?.trim()
      }
    } catch (error) {
      this.logger.warn('Failed to extract Medium metadata', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    return metadata
  }

  /**
   * Get Medium-specific scripts for content extraction
   */
  private getMediumScripts(): string[] {
    return [
      // Wait for Medium's dynamic content to load
      `
        if (window.location.hostname.includes('medium.com')) {
          const waitForContent = () => {
            return new Promise((resolve) => {
              const checkContent = () => {
                const article = document.querySelector('article, [data-testid="storyContent"]');
                if (article && article.children.length > 0) {
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

      // Remove Medium's paywall overlay if present
      `
        document.querySelectorAll('[data-testid="paywall"], .js-membershipPaywall').forEach(el => {
          el.style.display = 'none';
        });
      `,

      // Expand any collapsed content
      `
        document.querySelectorAll('[data-testid="expandButton"]').forEach(button => {
          button.click();
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

    // Check if DOM has Medium-specific elements
    if (dom) {
      return !!(
        dom.querySelector('[data-testid="storyContent"]') ||
        dom.querySelector('article') ||
        dom.querySelector('.js-postArticle') ||
        dom.querySelector('.metabar')
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
      supportedDomains: ['medium.com', '*.medium.com'],
      supportedContentTypes: [ContentType.HTML],
      features: {
        paywallDetection: true,
        authorExtraction: true,
        publicationExtraction: true,
        imageOptimization: true,
        contentCleaning: true,
        customScripts: true,
        tagExtraction: true,
        readTimeExtraction: true,
        clapCountExtraction: true,
      },
    }
  }
}
