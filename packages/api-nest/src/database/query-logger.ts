import { Logger, QueryRunner } from 'typeorm'
import { StructuredLogger } from '../logging/structured-logger.service'

/**
 * Custom TypeORM logger that tracks query performance
 * and warns about slow queries in development
 */
export class QueryPerformanceLogger implements Logger {
  private readonly slowQueryThreshold = 500 // ms
  private readonly warnQueryThreshold = 200 // ms

  constructor(
    private readonly logger: StructuredLogger,
    private readonly enabled: boolean = true,
  ) {}

  /**
   * Logs query execution with timing
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    if (!this.enabled) return

    // Extract the main operation type
    const operation = this.extractOperation(query)

    this.logger.debug(`Query: ${operation}`, {
      operation: 'database',
      queryType: operation,
    })
  }

  /**
   * Logs query errors
   */
  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const operation = this.extractOperation(query)
    const errorMessage = error instanceof Error ? error.message : error

    this.logger.error(
      `Query failed: ${operation}`,
      error instanceof Error ? error : new Error(errorMessage),
      {
        operation: 'database',
        queryType: operation,
      },
      {
        query: this.truncateQuery(query),
        parameters,
      },
    )
  }

  /**
   * Logs slow queries (executed via TypeORM query runner)
   */
  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const operation = this.extractOperation(query)

    this.logger.warn(`Slow query detected: ${operation}`, {
      operation: 'database',
      queryType: operation,
    }, {
      executionTime: `${time}ms`,
      query: this.truncateQuery(query),
      parameters,
    })
  }

  /**
   * Logs schema build
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.logger.log(message, { operation: 'schema' })
  }

  /**
   * Logs migration
   */
  logMigration(message: string, queryRunner?: QueryRunner) {
    this.logger.log(message, { operation: 'migration' })
  }

  /**
   * Logs general messages
   */
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
      case 'info':
        this.logger.log(message, { operation: 'database' })
        break
      case 'warn':
        this.logger.warn(message, { operation: 'database' })
        break
    }
  }

  /**
   * Extract operation type from SQL query
   */
  private extractOperation(query: string): string {
    const normalized = query.trim().toUpperCase()

    if (normalized.startsWith('SELECT')) return 'SELECT'
    if (normalized.startsWith('INSERT')) return 'INSERT'
    if (normalized.startsWith('UPDATE')) return 'UPDATE'
    if (normalized.startsWith('DELETE')) return 'DELETE'
    if (normalized.startsWith('CREATE')) return 'CREATE'
    if (normalized.startsWith('ALTER')) return 'ALTER'
    if (normalized.startsWith('DROP')) return 'DROP'

    return 'QUERY'
  }

  /**
   * Truncate long queries for logging
   */
  private truncateQuery(query: string, maxLength = 200): string {
    if (query.length <= maxLength) return query

    return query.substring(0, maxLength) + '...'
  }
}

/**
 * Interceptor to measure query execution time manually
 * Use this in services for critical queries
 */
export class QueryTimer {
  private startTime: number

  constructor(
    private readonly logger: StructuredLogger,
    private readonly queryName: string,
  ) {
    this.startTime = Date.now()
  }

  /**
   * End timer and log if query was slow
   */
  end(rowCount?: number): number {
    const duration = Date.now() - this.startTime

    const meta: any = { duration: `${duration}ms` }
    if (rowCount !== undefined) meta.rowCount = rowCount

    if (duration > 500) {
      this.logger.warn(`Slow query: ${this.queryName}`, {
        operation: 'database',
      }, meta)
    } else if (duration > 200) {
      this.logger.debug(`Query: ${this.queryName}`, {
        operation: 'database',
      }, meta)
    }

    return duration
  }
}
