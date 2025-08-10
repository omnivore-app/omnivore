/**
 * Twitter/X Content Handler
 *
 * Specialized handler for Twitter/X posts and threads.
 */

import { logger as baseLogger } from '../../../utils/logger'
import { ContentType } from '../../../events/content/content-save-event'
import { ContentHandler, RawContent, ExtractionOptions } from '../../types'

export class TwitterHandler implements ContentHandler {
  public readonly name = 'twitter-handler'
  public readonly urlPatterns = [/twitter\.com/i, /x\.com/i]

  private logger = baseLogger.child({ context: 'twitter-handler' })

  /**
   * Check if this handler can process the content
   */
  canHandle(url: string, contentType: ContentType): boolean {
    try {
      const parsedUrl = new URL(url)
      const hostname = parsedUrl.hostname.toLowerCase()
      return hostname.includes('twitter.com') || hostname.includes('x.com')
    } catch {
      return false
    }
  }

  /**
   * Extract content using Twitter-specific logic
   */
  async extract(
    url: string,
    options: ExtractionOptions = {}
  ): Promise<RawContent> {
    this.logger.debug('Extracting Twitter content', { url })

    const twitterOptions: ExtractionOptions = {
      ...options,
      waitForSelector: '[data-testid="tweet"], article[data-testid="tweet"]',
      customScripts: this.getTwitterScripts(),
      enableJavaScript: true, // Twitter requires JS
    }

    throw new Error(
      'Twitter handler requires integration with extraction service'
    )
  }

  /**
   * Process extracted content with Twitter-specific enhancements
   */
  async process(content: RawContent): Promise<RawContent> {
    this.logger.debug('Processing Twitter content', { url: content.url })

    try {
      const processedContent = { ...content }

      // Clean up Twitter-specific elements
      if (content.dom) {
        const cleanedDom = this.cleanTwitterContent(content.dom)
        processedContent.dom = cleanedDom
        processedContent.html = cleanedDom.documentElement.outerHTML
        processedContent.text = cleanedDom.body?.textContent || content.text
      }

      // Extract Twitter metadata
      const twitterMetadata = this.extractTwitterMetadata(content)
      processedContent.metadata = {
        ...content.metadata,
        ...twitterMetadata,
        processedBy: this.name,
      }

      this.logger.info('Twitter content processed', {
        url: content.url,
        hasAuthor: !!twitterMetadata.author,
        isThread: twitterMetadata.isThread,
        hasMedia: twitterMetadata.hasMedia,
      })

      return processedContent
    } catch (error) {
      this.logger.error('Twitter content processing failed', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      return content
    }
  }

  /**
   * Clean Twitter-specific content
   */
  private cleanTwitterContent(dom: Document): Document {
    const clonedDom = dom.cloneNode(true) as Document

    // Remove Twitter UI elements
    const elementsToRemove = [
      // Navigation and header
      '[data-testid="primaryNavigation"]',
      '[data-testid="sidebarColumn"]',
      'header[role="banner"]',

      // Recommendations and trending
      '[data-testid="trend"]',
      '[data-testid="UserCell"]',
      '[data-testid="cellInnerDiv"]',

      // Ads and promoted content
      '[data-testid="placementTracking"]',
      '[aria-label*="Promoted"]',

      // Footer and extra UI
      '[data-testid="bottomBar"]',
      '[data-testid="toolBar"]',

      // Login prompts
      '[data-testid="loginButton"]',
      '[data-testid="signupButton"]',
    ]

    elementsToRemove.forEach((selector) => {
      clonedDom.querySelectorAll(selector).forEach((el) => el.remove())
    })

    // Keep only the main tweet content
    const tweetElements = clonedDom.querySelectorAll('[data-testid="tweet"]')
    if (tweetElements.length > 0) {
      // Create a new body with just the tweets
      const newBody = clonedDom.createElement('body')
      tweetElements.forEach((tweet) => {
        newBody.appendChild(tweet.cloneNode(true))
      })
      clonedDom.documentElement.replaceChild(newBody, clonedDom.body)
    }

    return clonedDom
  }

  /**
   * Extract Twitter-specific metadata
   */
  private extractTwitterMetadata(content: RawContent): Record<string, any> {
    const metadata: Record<string, any> = {
      platform: 'Twitter',
      contentType: 'tweet',
    }

    if (!content.dom) {
      return metadata
    }

    try {
      // Extract tweet author
      const authorElement = content.dom.querySelector(
        '[data-testid="User-Name"] span, [data-testid="User-Names"] span'
      )
      if (authorElement) {
        metadata.author = authorElement.textContent?.trim()
      }

      // Extract username
      const usernameElement = content.dom.querySelector(
        '[data-testid="User-Names"] [dir="ltr"]'
      )
      if (usernameElement) {
        metadata.username = usernameElement.textContent?.trim()
      }

      // Extract tweet text
      const tweetTextElement = content.dom.querySelector(
        '[data-testid="tweetText"]'
      )
      if (tweetTextElement) {
        metadata.tweetText = tweetTextElement.textContent?.trim()
      }

      // Extract timestamp
      const timeElement = content.dom.querySelector('time')
      if (timeElement) {
        metadata.publishedTime = timeElement.getAttribute('datetime')
        metadata.timeText = timeElement.textContent?.trim()
      }

      // Check for media content
      const mediaElements = content.dom.querySelectorAll(
        '[data-testid="tweetPhoto"], [data-testid="videoPlayer"], [data-testid="card.layoutLarge.media"]'
      )
      if (mediaElements.length > 0) {
        metadata.hasMedia = true
        metadata.mediaCount = mediaElements.length
      }

      // Extract engagement metrics
      const replyElement = content.dom.querySelector('[data-testid="reply"]')
      if (replyElement) {
        metadata.replies = replyElement.textContent?.trim()
      }

      const retweetElement = content.dom.querySelector(
        '[data-testid="retweet"]'
      )
      if (retweetElement) {
        metadata.retweets = retweetElement.textContent?.trim()
      }

      const likeElement = content.dom.querySelector('[data-testid="like"]')
      if (likeElement) {
        metadata.likes = likeElement.textContent?.trim()
      }

      // Check if this is a thread
      const threadIndicators = content.dom.querySelectorAll(
        '[data-testid="tweet"]'
      )
      if (threadIndicators.length > 1) {
        metadata.isThread = true
        metadata.threadLength = threadIndicators.length
      }

      // Extract hashtags and mentions
      const hashtags = Array.from(
        content.dom.querySelectorAll('a[href*="/hashtag/"]')
      )
        .map((el) => el.textContent?.trim())
        .filter(Boolean)
      if (hashtags.length > 0) {
        metadata.hashtags = hashtags
      }

      const mentions = Array.from(content.dom.querySelectorAll('a[href^="/"]'))
        .filter((el) => el.textContent?.startsWith('@'))
        .map((el) => el.textContent?.trim())
        .filter(Boolean)
      if (mentions.length > 0) {
        metadata.mentions = mentions
      }
    } catch (error) {
      this.logger.warn('Failed to extract Twitter metadata', {
        url: content.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    return metadata
  }

  /**
   * Get Twitter-specific scripts for content extraction
   */
  private getTwitterScripts(): string[] {
    return [
      // Wait for Twitter content to load
      `
        if (window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com')) {
          const waitForTweet = () => {
            return new Promise((resolve) => {
              const checkTweet = () => {
                const tweet = document.querySelector('[data-testid="tweet"]');
                if (tweet) {
                  resolve(true);
                } else {
                  setTimeout(checkTweet, 100);
                }
              };
              checkTweet();
            });
          };
          
          waitForTweet();
        }
      `,

      // Expand any "Show this thread" links
      `
        document.querySelectorAll('[data-testid="showThread"]').forEach(button => {
          button.click();
        });
      `,

      // Remove any overlay prompts
      `
        document.querySelectorAll('[data-testid="sheetDialog"], [data-testid="loginPrompt"]').forEach(el => {
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

    // Check if DOM has Twitter-specific elements
    if (dom) {
      return !!(
        dom.querySelector('[data-testid="tweet"]') ||
        dom.querySelector('[data-testid="tweetText"]') ||
        dom.querySelector('[data-testid="User-Names"]')
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
      supportedDomains: ['twitter.com', 'x.com'],
      supportedContentTypes: [ContentType.HTML],
      features: {
        threadDetection: true,
        authorExtraction: true,
        engagementMetrics: true,
        mediaDetection: true,
        hashtagExtraction: true,
        mentionExtraction: true,
        contentCleaning: true,
        customScripts: true,
        requiresJavaScript: true,
      },
    }
  }
}
