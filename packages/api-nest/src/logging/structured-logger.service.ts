import { Injectable, LoggerService, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from '../config/env-variables'

export interface LogContext {
  correlationId?: string
  userId?: string
  email?: string
  operation?: string
  resource?: string
  [key: string]: any
}

export interface StructuredLogEntry {
  timestamp: string
  level: string
  message: string
  context?: LogContext
  meta?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLogger implements LoggerService {
  private context: LogContext = {}
  private readonly serviceName: string
  private readonly environment: string

  constructor(private readonly configService: ConfigService) {
    this.serviceName = 'omnivore-api-nest'
    this.environment = this.configService.get<string>(
      EnvVariables.NODE_ENV,
      'development',
    )
  }

  /**
   * Set persistent context for this logger instance
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * Add temporary context to a single log entry
   */
  withContext(context: LogContext) {
    return {
      log: (message: string, meta?: Record<string, any>) =>
        this.log(message, { ...context }, meta),
      error: (message: string, error?: Error, meta?: Record<string, any>) =>
        this.error(message, error, { ...context }, meta),
      warn: (message: string, meta?: Record<string, any>) =>
        this.warn(message, { ...context }, meta),
      debug: (message: string, meta?: Record<string, any>) =>
        this.debug(message, { ...context }, meta),
      verbose: (message: string, meta?: Record<string, any>) =>
        this.verbose(message, { ...context }, meta),
    }
  }

  log(message: string, context?: LogContext, meta?: Record<string, any>): void {
    this.writeLog('info', message, context, meta)
  }

  error(
    message: string,
    error?: Error,
    context?: LogContext,
    meta?: Record<string, any>,
  ): void {
    const errorMeta = error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : undefined

    this.writeLog('error', message, context, meta, errorMeta)
  }

  warn(
    message: string,
    context?: LogContext,
    meta?: Record<string, any>,
  ): void {
    this.writeLog('warn', message, context, meta)
  }

  debug(
    message: string,
    context?: LogContext,
    meta?: Record<string, any>,
  ): void {
    this.writeLog('debug', message, context, meta)
  }

  verbose(
    message: string,
    context?: LogContext,
    meta?: Record<string, any>,
  ): void {
    this.writeLog('verbose', message, context, meta)
  }

  private writeLog(
    level: string,
    message: string,
    context?: LogContext,
    meta?: Record<string, any>,
    error?: { name: string; message: string; stack?: string },
  ): void {
    const logEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        service: this.serviceName,
        environment: this.environment,
        ...this.context,
        ...context,
      },
      ...(meta && { meta }),
      ...(error && { error }),
    }

    // In development, use pretty printing
    if (this.environment === 'development') {
      this.prettyPrint(logEntry)
    } else {
      // In production, use structured JSON for log aggregation
      console.log(JSON.stringify(logEntry))
    }
  }

  private prettyPrint(entry: StructuredLogEntry): void {
    const timestamp = entry.timestamp
    const level = entry.level.toUpperCase().padEnd(7)
    const correlationId = entry.context?.correlationId
      ? `[${entry.context.correlationId.slice(0, 8)}]`
      : '[--------]'
    const userId = entry.context?.userId ? `[${entry.context.userId}]` : ''

    let logLine = `${timestamp} ${level} ${correlationId}${userId} ${entry.message}`

    // Add context details if present
    if (entry.context && Object.keys(entry.context).length > 3) {
      const contextDetails = Object.entries(entry.context)
        .filter(
          ([key]) =>
            !['service', 'environment', 'correlationId', 'userId'].includes(
              key,
            ),
        )
        .map(([key, value]) => `${key}=${value}`)
        .join(' ')

      if (contextDetails) {
        logLine += ` | ${contextDetails}`
      }
    }

    // Add metadata if present
    if (entry.meta && Object.keys(entry.meta).length > 0) {
      logLine += ` | meta: ${JSON.stringify(entry.meta)}`
    }

    console.log(logLine)

    // Print error details if present
    if (entry.error) {
      console.log(`  Error: ${entry.error.name}: ${entry.error.message}`)
      if (entry.error.stack && this.environment === 'development') {
        console.log(`  Stack: ${entry.error.stack}`)
      }
    }
  }
}
