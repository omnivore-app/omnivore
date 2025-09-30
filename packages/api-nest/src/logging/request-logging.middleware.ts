import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { StructuredLogger } from './structured-logger.service'
import { RequestWithCorrelationId } from './correlation-id.middleware'

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: StructuredLogger) {}

  use(req: RequestWithCorrelationId, res: Response, next: NextFunction) {
    const startTime = Date.now()
    const { method, url, headers } = req

    // Set correlation ID context for this request
    this.logger.setContext({
      correlationId: req.correlationId,
      operation: 'http_request',
    })

    // Log incoming request
    this.logger.log('Incoming HTTP request', {
      method,
      url,
      userAgent: headers['user-agent'],
      contentLength: headers['content-length'],
      contentType: headers['content-type'],
    })

    // Capture original response methods
    const originalSend = res.send
    const originalJson = res.json

    let responseBody: any = null
    let responseSent = false

    // Override response methods to capture response data
    res.send = function (body: any) {
      if (!responseSent) {
        responseBody = body
        responseSent = true
      }
      return originalSend.call(this, body)
    }

    res.json = function (body: any) {
      if (!responseSent) {
        responseBody = body
        responseSent = true
      }
      return originalJson.call(this, body)
    }

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime
      const { statusCode } = res
      const contentLength = res.get('content-length')

      const logContext = {
        correlationId: req.correlationId,
        operation: 'http_response',
        method,
        url,
        statusCode,
        duration,
        contentLength: contentLength ? parseInt(contentLength, 10) : undefined,
      }

      if (statusCode >= 400) {
        this.logger.error('HTTP request failed', undefined, logContext, {
          responseBody: this.sanitizeResponseBody(responseBody),
        })
      } else {
        this.logger.log('HTTP request completed', logContext, {
          responseBody: this.sanitizeResponseBody(
            responseBody,
            statusCode < 300,
          ),
        })
      }
    })

    next()
  }

  private sanitizeResponseBody(body: any, isSuccess = false): any {
    if (!body) return undefined

    // For successful requests, only log minimal info to avoid noise
    if (isSuccess) {
      if (typeof body === 'object') {
        // Just log the keys and array lengths, not full content
        if (Array.isArray(body)) {
          return { _type: 'array', length: body.length }
        }

        const keys = Object.keys(body)
        return { _type: 'object', keys: keys.slice(0, 5) }
      }

      return { _type: typeof body, preview: String(body).slice(0, 100) }
    }

    // For error responses, log more details but sanitize sensitive fields
    if (typeof body === 'object') {
      const sanitized = { ...body }

      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth']
      sensitiveFields.forEach((field) => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]'
        }
      })

      return sanitized
    }

    return body
  }
}
