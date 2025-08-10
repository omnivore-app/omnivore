/**
 * Content Handler Registry
 *
 * Manages specialized content handlers for specific websites and platforms.
 * Migrated from the content-handler service.
 */

import { logger as baseLogger } from '../../utils/logger'
import { ContentType } from '../../events/content/content-save-event'
import {
  ContentHandler,
  RawContent,
  ExtractionOptions,
  ContentHandlerError,
} from '../types'

// Import specialized handlers
import { SubstackHandler } from './newsletters/substack-handler'
import { MediumHandler } from './websites/medium-handler'
import { TwitterHandler } from './websites/twitter-handler'
import { YouTubeHandler } from './websites/youtube-handler'
import { GitHubHandler } from './websites/github-handler'
import { StackOverflowHandler } from './websites/stackoverflow-handler'
import { GenericHandler } from './newsletters/generic-handler'

export class HandlerRegistry {
  private logger = baseLogger.child({ context: 'handler-registry' })
  private handlers: Map<string, ContentHandler> = new Map()
  private urlPatternHandlers: Array<{
    pattern: RegExp
    handler: ContentHandler
  }> = []

  constructor() {
    this.initializeHandlers()
  }

  /**
   * Initialize all available handlers
   */
  private initializeHandlers(): void {
    // Newsletter handlers
    this.registerHandler('substack', new SubstackHandler())
    this.registerHandler('generic-newsletter', new GenericHandler())

    // Website handlers
    this.registerHandler('medium', new MediumHandler())
    this.registerHandler('twitter', new TwitterHandler())
    this.registerHandler('youtube', new YouTubeHandler())
    this.registerHandler('github', new GitHubHandler())
    this.registerHandler('stackoverflow', new StackOverflowHandler())

    this.logger.info('Handler registry initialized', {
      handlerCount: this.handlers.size,
      patternHandlerCount: this.urlPatternHandlers.length,
    })
  }

  /**
   * Register a content handler
   */
  registerHandler(name: string, handler: ContentHandler): void {
    this.handlers.set(name, handler)

    // If handler has URL patterns, add to pattern matching
    if (handler.urlPatterns && handler.urlPatterns.length > 0) {
      handler.urlPatterns.forEach((pattern) => {
        this.urlPatternHandlers.push({ pattern, handler })
      })
    }

    this.logger.info('Handler registered', {
      name,
      handlerName: handler.name,
      hasUrlPatterns: !!(handler.urlPatterns && handler.urlPatterns.length > 0),
    })
  }

  /**
   * Unregister a content handler
   */
  unregisterHandler(name: string): void {
    const handler = this.handlers.get(name)
    if (handler) {
      this.handlers.delete(name)

      // Remove from pattern handlers
      this.urlPatternHandlers = this.urlPatternHandlers.filter(
        (entry) => entry.handler !== handler
      )

      this.logger.info('Handler unregistered', { name })
    }
  }

  /**
   * Get appropriate handler for URL and content type
   */
  getHandler(url: string, contentType: ContentType): ContentHandler | null {
    try {
      // First check URL pattern-based handlers
      for (const { pattern, handler } of this.urlPatternHandlers) {
        if (pattern.test(url)) {
          if (handler.canHandle(url, contentType)) {
            this.logger.info('Handler found by URL pattern', {
              url,
              handlerName: handler.name,
              pattern: pattern.source,
            })
            return handler
          }
        }
      }

      // Check domain-specific handlers
      const parsedUrl = new URL(url)
      const hostname = parsedUrl.hostname.toLowerCase()

      // Check for specific domain handlers
      const domainHandlers = [
        { domains: ['substack.com'], handler: this.handlers.get('substack') },
        { domains: ['medium.com'], handler: this.handlers.get('medium') },
        {
          domains: ['twitter.com', 'x.com'],
          handler: this.handlers.get('twitter'),
        },
        {
          domains: ['youtube.com', 'youtu.be'],
          handler: this.handlers.get('youtube'),
        },
        { domains: ['github.com'], handler: this.handlers.get('github') },
        {
          domains: ['stackoverflow.com'],
          handler: this.handlers.get('stackoverflow'),
        },
      ]

      for (const { domains, handler } of domainHandlers) {
        if (handler && domains.some((domain) => hostname.includes(domain))) {
          if (handler.canHandle(url, contentType)) {
            this.logger.info('Handler found by domain', {
              url,
              handlerName: handler.name,
              domain: hostname,
            })
            return handler
          }
        }
      }

      // Check for newsletter content
      if (contentType === ContentType.EMAIL || this.isNewsletterUrl(url)) {
        const genericHandler = this.handlers.get('generic-newsletter')
        if (genericHandler && genericHandler.canHandle(url, contentType)) {
          this.logger.info('Using generic newsletter handler', { url })
          return genericHandler
        }
      }

      this.logger.info('No specialized handler found', { url, contentType })
      return null
    } catch (error) {
      this.logger.error('Error finding handler', {
        url,
        contentType,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
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
      /substack\.com/i,
      /beehiiv\.com/i,
      /convertkit\.com/i,
      /ghost\.io/i,
    ]

    return newsletterPatterns.some((pattern) => pattern.test(url))
  }

  /**
   * Get all registered handlers
   */
  getHandlers(): Map<string, ContentHandler> {
    return new Map(this.handlers)
  }

  /**
   * Get handler by name
   */
  getHandlerByName(name: string): ContentHandler | null {
    return this.handlers.get(name) || null
  }

  /**
   * Check if handler exists
   */
  hasHandler(name: string): boolean {
    return this.handlers.has(name)
  }

  /**
   * Get handler statistics
   */
  getStats() {
    const handlers = Array.from(this.handlers.entries()).map(
      ([name, handler]) => ({
        name,
        handlerName: handler.name,
        hasUrlPatterns: !!(
          handler.urlPatterns && handler.urlPatterns.length > 0
        ),
        canHandleNewsletter: handler.canHandle(
          'https://example.com',
          ContentType.EMAIL
        ),
      })
    )

    return {
      totalHandlers: this.handlers.size,
      patternHandlers: this.urlPatternHandlers.length,
      handlers,
    }
  }

  /**
   * Test handler matching for debugging
   */
  testHandlerMatching(url: string, contentType: ContentType) {
    const results = []

    // Test all handlers
    for (const [name, handler] of this.handlers) {
      try {
        const canHandle = handler.canHandle(url, contentType)
        results.push({
          name,
          handlerName: handler.name,
          canHandle,
          error: null,
        })
      } catch (error) {
        results.push({
          name,
          handlerName: handler.name,
          canHandle: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const selectedHandler = this.getHandler(url, contentType)

    return {
      url,
      contentType,
      selectedHandler: selectedHandler?.name || null,
      allResults: results,
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up handler registry')

    // Cleanup handlers that support it
    for (const [name, handler] of this.handlers) {
      if ('cleanup' in handler && typeof handler.cleanup === 'function') {
        try {
          await (handler as any).cleanup()
          this.logger.info('Handler cleaned up', { name })
        } catch (error) {
          this.logger.error('Handler cleanup failed', {
            name,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    this.handlers.clear()
    this.urlPatternHandlers = []
  }
}
