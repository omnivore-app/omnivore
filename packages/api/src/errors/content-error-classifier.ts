import { logger } from '../utils/logger'

export interface ClassifiedError {
  readonly errorType: ContentErrorType
  readonly category: string
  readonly severity: 'low' | 'medium' | 'high' | 'critical'
  readonly isRetryable: boolean
  readonly retryable: boolean // Alias for backward compatibility
  readonly userMessage: string
  readonly technicalMessage: string
  readonly shouldNotifyUser: boolean
  readonly retryDelay?: number
}

export enum ContentErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  DNS_ERROR = 'DNS_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  PARSING_ERROR = 'PARSING_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  INVALID_URL_ERROR = 'INVALID_URL_ERROR',
  SSL_ERROR = 'SSL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Classifies content processing errors to determine retry behavior and user communication
 */
export class ContentErrorClassifier {
  private readonly logger = logger.child({
    context: 'content-error-classifier',
  })

  /**
   * Classify an error to determine its type and retry behavior
   * @param error The error to classify
   * @param url The URL that was being processed when the error occurred
   * @returns A classified error with retry and communication metadata
   */
  classify(error: Error, url: string): ClassifiedError {
    this.logger.debug('Classifying error', {
      url,
      errorMessage: error.message,
      errorName: error.name,
    })

    const errorMessage = error.message.toLowerCase()
    const errorStack = error.stack?.toLowerCase() || ''

    // Network and connection errors (retryable)
    if (this.isNetworkError(errorMessage, errorStack)) {
      // Check for DNS-specific errors which should be treated as non-retryable
      if (this.isDnsError(errorMessage, errorStack)) {
        return this.createClassifiedError(
          ContentErrorType.DNS_ERROR,
          false, // DNS errors are not retryable
          'The website address could not be found. Please check the URL and try again.',
          error.message,
          true // Notify user immediately
        )
      }

      return this.createClassifiedError(
        ContentErrorType.NETWORK_ERROR,
        true,
        'Unable to connect to the website. Please check your internet connection and try again.',
        error.message,
        false,
        5000 // 5 second retry delay
      )
    }

    // Timeout errors (retryable)
    if (this.isTimeoutError(errorMessage, errorStack)) {
      return this.createClassifiedError(
        ContentErrorType.TIMEOUT_ERROR,
        true,
        "The website took too long to respond. We'll try again in a moment.",
        error.message,
        false,
        10000 // 10 second retry delay
      )
    }

    // SSL/Certificate errors (retryable with different strategy)
    if (this.isSSLError(errorMessage, errorStack)) {
      return this.createClassifiedError(
        ContentErrorType.SSL_ERROR,
        true,
        "There was a security certificate issue with the website. We'll try an alternative approach.",
        error.message,
        false,
        2000 // 2 second retry delay
      )
    }

    // Rate limiting errors (retryable with longer delay)
    if (this.isRateLimitError(errorMessage, errorStack)) {
      return this.createClassifiedError(
        ContentErrorType.RATE_LIMIT_ERROR,
        true,
        "The website is temporarily limiting requests. We'll try again shortly.",
        error.message,
        false,
        30000 // 30 second retry delay
      )
    }

    // Content not found (not retryable)
    if (this.isNotFoundError(errorMessage, errorStack)) {
      return this.createClassifiedError(
        ContentErrorType.CONTENT_NOT_FOUND,
        false,
        'The content could not be found. Please check that the URL is correct.',
        error.message,
        true
      )
    }

    // Invalid URL (not retryable)
    if (this.isInvalidUrlError(errorMessage, errorStack, url)) {
      return this.createClassifiedError(
        ContentErrorType.INVALID_URL_ERROR,
        false,
        'The URL appears to be invalid. Please check the link and try again.',
        error.message,
        true
      )
    }

    // Authentication/Permission errors (not retryable)
    if (this.isAuthError(errorMessage, errorStack)) {
      return this.createClassifiedError(
        ContentErrorType.AUTHENTICATION_ERROR,
        false,
        'This content requires authentication or has restricted access.',
        error.message,
        true
      )
    }

    // Server errors (retryable)
    if (this.isServerError(errorMessage, errorStack)) {
      return this.createClassifiedError(
        ContentErrorType.SERVER_ERROR,
        true,
        "The website is experiencing technical difficulties. We'll try again soon.",
        error.message,
        false,
        15000 // 15 second retry delay
      )
    }

    // Default to unknown error (retryable with caution)
    return this.createClassifiedError(
      ContentErrorType.UNKNOWN_ERROR,
      true,
      'An unexpected error occurred while processing this content.',
      error.message,
      false,
      10000 // 10 second retry delay
    )
  }

  private createClassifiedError(
    errorType: ContentErrorType,
    isRetryable: boolean,
    userMessage: string,
    technicalMessage: string,
    shouldNotifyUser: boolean,
    retryDelay?: number
  ): ClassifiedError {
    // Map error type to category and severity
    const { category, severity } = this.mapErrorTypeToMetadata(errorType)

    return {
      errorType,
      category,
      severity,
      isRetryable,
      retryable: isRetryable, // Alias for backward compatibility
      userMessage,
      technicalMessage,
      shouldNotifyUser,
      retryDelay,
    }
  }

  private mapErrorTypeToMetadata(errorType: ContentErrorType): {
    category: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  } {
    switch (errorType) {
      case ContentErrorType.NETWORK_ERROR:
        return { category: 'network', severity: 'medium' }
      case ContentErrorType.DNS_ERROR:
        return { category: 'dns', severity: 'high' }
      case ContentErrorType.TIMEOUT_ERROR:
        return { category: 'timeout', severity: 'medium' }
      case ContentErrorType.SSL_ERROR:
        return { category: 'ssl', severity: 'medium' }
      case ContentErrorType.AUTHENTICATION_ERROR:
        return { category: 'auth', severity: 'high' }
      case ContentErrorType.PERMISSION_ERROR:
        return { category: 'permission', severity: 'high' }
      case ContentErrorType.CONTENT_NOT_FOUND:
        return { category: 'not_found', severity: 'low' }
      case ContentErrorType.PARSING_ERROR:
        return { category: 'parsing', severity: 'medium' }
      case ContentErrorType.RATE_LIMIT_ERROR:
        return { category: 'rate_limit', severity: 'medium' }
      case ContentErrorType.SERVER_ERROR:
        return { category: 'server', severity: 'high' }
      case ContentErrorType.INVALID_URL_ERROR:
        return { category: 'invalid_url', severity: 'low' }
      case ContentErrorType.UNKNOWN_ERROR:
      default:
        return { category: 'unknown', severity: 'medium' }
    }
  }

  private isNetworkError(errorMessage: string, errorStack: string): boolean {
    const networkPatterns = [
      'network error',
      'connection refused',
      'connection reset',
      'connection timeout',
      'connection failed',
      'net::err_',
      'ns_error_unknown_host',
      'ns_error_connection_refused',
      'enotfound',
      'econnrefused',
      'econnreset',
      'etimeout',
      'socket hang up',
      'getaddrinfo failed',
    ]
    return networkPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
    )
  }

  private isDnsError(errorMessage: string, errorStack: string): boolean {
    const dnsPatterns = [
      'ns_error_unknown_host',
      'enotfound',
      'getaddrinfo failed',
      'dns resolution failed',
      'name or service not known',
      'name resolution failed',
      'no address associated with hostname',
    ]
    return dnsPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
    )
  }

  private isTimeoutError(errorMessage: string, errorStack: string): boolean {
    const timeoutPatterns = [
      'timeout',
      'timed out',
      'navigation timeout',
      'waiting for selector',
      'waiting failed',
    ]
    return timeoutPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
    )
  }

  private isSSLError(errorMessage: string, errorStack: string): boolean {
    const sslPatterns = [
      'ssl',
      'certificate',
      'cert',
      'tls',
      'ssl_error_bad_cert_domain',
      'net::err_cert_',
      'self signed certificate',
      'certificate verify failed',
    ]
    return sslPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
    )
  }

  private isRateLimitError(errorMessage: string, errorStack: string): boolean {
    const rateLimitPatterns = [
      'rate limit',
      'too many requests',
      'rate exceeded',
      'quota exceeded',
      '429',
      'throttled',
    ]
    return rateLimitPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
    )
  }

  private isNotFoundError(errorMessage: string, errorStack: string): boolean {
    const notFoundPatterns = [
      '404',
      'not found',
      'page not found',
      'content not found',
      'no such file',
    ]
    return notFoundPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
    )
  }

  private isInvalidUrlError(
    errorMessage: string,
    errorStack: string,
    url: string
  ): boolean {
    const invalidUrlPatterns = [
      'invalid url',
      'malformed url',
      'invalid uri',
      'url parse error',
    ]

    const hasInvalidPattern = invalidUrlPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
    )

    // Also check if URL looks obviously invalid
    const urlLooksInvalid =
      !url || !url.match(/^https?:\/\//) || url.includes(' ') || url.length < 10

    return hasInvalidPattern || urlLooksInvalid
  }

  private isAuthError(errorMessage: string, errorStack: string): boolean {
    const authPatterns = [
      'unauthorized',
      'forbidden',
      'access denied',
      'authentication required',
      'login required',
      '401',
      '403',
    ]
    return authPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
    )
  }

  private isServerError(errorMessage: string, errorStack: string): boolean {
    const serverErrorPatterns = [
      '500',
      '502',
      '503',
      '504',
      'internal server error',
      'bad gateway',
      'service unavailable',
      'gateway timeout',
      'server error',
    ]
    return serverErrorPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
    )
  }
}
