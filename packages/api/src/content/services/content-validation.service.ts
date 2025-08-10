/**
 * Content Validation Service
 *
 * Validates URLs, detects content types, and ensures content can be processed
 * before attempting extraction and processing.
 */

import { URL } from 'url'
import { logger as baseLogger } from '../../utils/logger'
import { ContentType } from '../../events/content/content-save-event'
import { ContentValidationError } from '../types'
import { determineContentType } from '../../utils/content-type-detector'

export class ContentValidationService {
  private logger = baseLogger.child({ context: 'content-validation-service' })

  // Blocked domains and patterns
  private blockedDomains = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    'metadata.google.internal',
  ])

  private blockedPatterns = [
    /^192\.168\./, // Private networks
    /^10\./, // Private networks
    /^172\.(1[6-9]|2\d|3[01])\./, // Private networks
    /^169\.254\./, // Link-local
    /^224\./, // Multicast
    /^240\./, // Reserved
  ]

  /**
   * Validate URL and content type
   */
  async validate(url: string, contentType: ContentType): Promise<void> {
    // Validate URL format
    await this.validateUrl(url)

    // Validate content type
    this.validateContentType(contentType)

    // Check if URL is accessible
    await this.validateAccessibility(url)
  }

  /**
   * Detect content type from URL
   */
  async detectContentType(url: string): Promise<ContentType> {
    try {
      // First try to determine from URL patterns
      const detectedType = determineContentType(url)

      // For HTML content, we might want to make a HEAD request to check MIME type
      if (detectedType === ContentType.HTML) {
        const mimeType = await this.getMimeType(url)
        if (mimeType) {
          const typeFromMime = determineContentType(url, mimeType)
          if (typeFromMime !== ContentType.HTML) {
            return typeFromMime
          }
        }
      }

      return detectedType
    } catch (error) {
      this.logger.warn('Content type detection failed, defaulting to HTML', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return ContentType.HTML
    }
  }

  /**
   * Validate URL format and accessibility
   */
  private async validateUrl(url: string): Promise<void> {
    let parsedUrl: URL

    try {
      parsedUrl = new URL(url)
    } catch (error) {
      throw new ContentValidationError(`Invalid URL format: ${url}`, url)
    }

    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new ContentValidationError(
        `Unsupported protocol: ${parsedUrl.protocol}`,
        url
      )
    }

    // Check for blocked domains
    const hostname = parsedUrl.hostname.toLowerCase()
    if (this.blockedDomains.has(hostname)) {
      throw new ContentValidationError(`Blocked domain: ${hostname}`, url)
    }

    // Check for blocked IP patterns
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(hostname)) {
        throw new ContentValidationError(`Blocked IP address: ${hostname}`, url)
      }
    }

    // Check for private IP addresses
    if (this.isPrivateIP(hostname)) {
      throw new ContentValidationError(
        `Private IP address not allowed: ${hostname}`,
        url
      )
    }
  }

  /**
   * Validate content type
   */
  private validateContentType(contentType: ContentType): void {
    if (!Object.values(ContentType).includes(contentType)) {
      throw new ContentValidationError(
        `Unsupported content type: ${contentType}`,
        '',
        contentType
      )
    }
  }

  /**
   * Check if URL is accessible
   */
  private async validateAccessibility(url: string): Promise<void> {
    try {
      // Make a HEAD request to check if URL is accessible
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Omnivore/1.0 (+https://omnivore.app)',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok && response.status >= 400) {
        // Allow some 4xx errors that might still have content
        const allowedErrorCodes = [401, 403, 429]
        if (!allowedErrorCodes.includes(response.status)) {
          throw new ContentValidationError(
            `URL not accessible: ${response.status} ${response.statusText}`,
            url
          )
        }
      }

      this.logger.debug('URL accessibility validated', {
        url,
        status: response.status,
        statusText: response.statusText,
      })
    } catch (error) {
      if (error instanceof ContentValidationError) {
        throw error
      }

      // Network errors or timeouts
      this.logger.warn('URL accessibility check failed', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Don't throw for network errors - the content might still be fetchable
      // with different methods (like Puppeteer)
    }
  }

  /**
   * Get MIME type from URL
   */
  private async getMimeType(url: string): Promise<string | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Omnivore/1.0 (+https://omnivore.app)',
        },
      })

      clearTimeout(timeoutId)

      const contentType = response.headers.get('content-type')
      return contentType ? contentType.split(';')[0].trim() : null
    } catch (error) {
      this.logger.debug('MIME type detection failed', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Check if hostname is a private IP address
   */
  private isPrivateIP(hostname: string): boolean {
    // IPv4 private ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = hostname.match(ipv4Regex)

    if (match) {
      const [, a, b, c, d] = match.map(Number)

      // Check for private ranges
      return (
        a === 10 || // 10.0.0.0/8
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
        (a === 192 && b === 168) || // 192.168.0.0/16
        (a === 169 && b === 254) || // 169.254.0.0/16 (link-local)
        a === 127 // 127.0.0.0/8 (loopback)
      )
    }

    // IPv6 private ranges (simplified check)
    if (hostname.includes(':')) {
      return (
        hostname.startsWith('::1') || // Loopback
        hostname.startsWith('fc') || // Unique local
        hostname.startsWith('fd') || // Unique local
        hostname.startsWith('fe80:') // Link-local
      )
    }

    return false
  }

  /**
   * Check if domain is blocked
   */
  isDomainBlocked(hostname: string): boolean {
    const lowerHostname = hostname.toLowerCase()

    if (this.blockedDomains.has(lowerHostname)) {
      return true
    }

    for (const pattern of this.blockedPatterns) {
      if (pattern.test(lowerHostname)) {
        return true
      }
    }

    return this.isPrivateIP(lowerHostname)
  }

  /**
   * Add blocked domain
   */
  addBlockedDomain(domain: string): void {
    this.blockedDomains.add(domain.toLowerCase())
    this.logger.info('Added blocked domain', { domain })
  }

  /**
   * Remove blocked domain
   */
  removeBlockedDomain(domain: string): void {
    this.blockedDomains.delete(domain.toLowerCase())
    this.logger.info('Removed blocked domain', { domain })
  }

  /**
   * Get blocked domains list
   */
  getBlockedDomains(): string[] {
    return Array.from(this.blockedDomains)
  }
}
