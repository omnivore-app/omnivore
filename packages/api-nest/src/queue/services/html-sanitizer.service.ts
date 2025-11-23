/**
 * HtmlSanitizerService - Sanitize HTML content to prevent XSS attacks
 *
 * Uses DOMPurify to sanitize HTML extracted from web pages before storing
 * in the database and displaying to users.
 */

import { Injectable, Logger } from '@nestjs/common'
import { parseHTML } from 'linkedom'
import createDOMPurify from 'dompurify'

// Create DOMPurify instance with linkedom window
// linkedom provides a DOM-compatible window object for Node.js
const { window } = parseHTML('<!DOCTYPE html>')
const DOMPurify = createDOMPurify(window as never)

export interface SanitizationOptions {
  /**
   * Allow data-* attributes (default: false for security)
   */
  allowDataAttributes?: boolean

  /**
   * Additional allowed tags beyond the default safe list
   */
  additionalAllowedTags?: string[]

  /**
   * Additional allowed attributes beyond the default safe list
   */
  additionalAllowedAttributes?: string[]
}

@Injectable()
export class HtmlSanitizerService {
  private readonly logger = new Logger(HtmlSanitizerService.name)

  /**
   * Default safe HTML tags for article content
   * Based on common article formatting needs while preventing XSS
   */
  private readonly DEFAULT_ALLOWED_TAGS = [
    // Paragraphs and text formatting
    'p',
    'br',
    'span',
    'div',

    // Text emphasis
    'b',
    'i',
    'strong',
    'em',
    'u',
    'mark',
    's',
    'del',
    'ins',
    'sub',
    'sup',
    'small',

    // Headings
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',

    // Links and images
    'a',
    'img',

    // Lists
    'ul',
    'ol',
    'li',
    'dl',
    'dt',
    'dd',

    // Quotes and code
    'blockquote',
    'q',
    'cite',
    'code',
    'pre',
    'kbd',
    'samp',
    'var',

    // Tables
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'colgroup',
    'col',

    // Semantic elements
    'article',
    'section',
    'aside',
    'header',
    'footer',
    'nav',
    'main',
    'figure',
    'figcaption',

    // Other
    'hr',
    'abbr',
    'address',
    'time',
  ]

  /**
   * Default safe HTML attributes
   */
  private readonly DEFAULT_ALLOWED_ATTR = [
    // Links
    'href',
    'target',
    'rel',

    // Images
    'src',
    'alt',
    'title',
    'width',
    'height',
    'loading',

    // General
    'class',
    'id',

    // Tables
    'colspan',
    'rowspan',

    // Semantic
    'datetime',
    'cite',
  ]

  /**
   * Sanitize HTML content
   *
   * @param html - Raw HTML content to sanitize
   * @param options - Optional sanitization configuration
   * @returns Sanitized HTML safe for display
   */
  sanitize(html: string, options?: SanitizationOptions): string {
    if (!html) {
      return ''
    }

    try {
      const allowedTags = [
        ...this.DEFAULT_ALLOWED_TAGS,
        ...(options?.additionalAllowedTags || []),
      ]

      const allowedAttr = [
        ...this.DEFAULT_ALLOWED_ATTR,
        ...(options?.additionalAllowedAttributes || []),
      ]

      const config = {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttr,
        ALLOW_DATA_ATTR: options?.allowDataAttributes || false,
        KEEP_CONTENT: true, // Keep text content even if tag is removed
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        FORCE_BODY: false,
      }

      const sanitized = String(DOMPurify.sanitize(html, config))

      // Log if significant content was removed (potential security issue)
      const removedRatio = 1 - sanitized.length / html.length
      if (removedRatio > 0.2) {
        // More than 20% removed
        this.logger.warn(
          `Sanitization removed ${(removedRatio * 100).toFixed(1)}% of HTML content. ` +
            `Original: ${html.length} chars, Sanitized: ${sanitized.length} chars`,
        )
      } else if (removedRatio > 0) {
        this.logger.debug(
          `Sanitization removed ${(removedRatio * 100).toFixed(1)}% of HTML content`,
        )
      }

      return sanitized
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to sanitize HTML: ${errorMessage}`)

      // On error, return empty string for safety
      // Better to show nothing than potentially unsafe content
      return ''
    }
  }

  /**
   * Sanitize HTML and strip all tags, returning plain text
   *
   * @param html - HTML content
   * @returns Plain text with all HTML tags removed
   */
  stripTags(html: string): string {
    if (!html) {
      return ''
    }

    try {
      // Sanitize first to ensure no malicious content
      const sanitized = String(
        DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [],
          KEEP_CONTENT: true,
        }),
      )

      // Clean up excessive whitespace
      return sanitized.replace(/\s+/g, ' ').trim()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to strip tags from HTML: ${errorMessage}`)
      return ''
    }
  }

  /**
   * Check if HTML contains potentially dangerous content
   *
   * @param html - HTML content to check
   * @returns True if content appears safe, false if suspicious
   */
  isSafe(html: string): boolean {
    if (!html) {
      return true
    }

    try {
      const sanitized = this.sanitize(html)

      // If sanitization removed >50% of content, it's suspicious
      const removedRatio = 1 - sanitized.length / html.length
      return removedRatio < 0.5
    } catch (error) {
      this.logger.error('Error checking HTML safety', error)
      return false
    }
  }

  /**
   * Sanitize attributes for a specific use case (like Open Graph images)
   *
   * @param url - URL to sanitize
   * @returns Sanitized URL or empty string if unsafe
   */
  sanitizeUrl(url: string): string {
    if (!url) {
      return ''
    }

    try {
      // Only allow http/https URLs
      const urlObj = new URL(url)
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        this.logger.warn(`Blocked non-HTTP(S) URL: ${url}`)
        return ''
      }

      return url
    } catch (error) {
      this.logger.warn(`Invalid URL rejected: ${url}`)
      return ''
    }
  }
}
