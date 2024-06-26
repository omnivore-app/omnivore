/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { LoggingWinston } from '@google-cloud/logging-winston'
import axios from 'axios'
import jsonStringify from 'fast-safe-stringify'
import { cloneDeep, isArray, isObject, isString, truncate } from 'lodash'
import { DateTime } from 'luxon'
import {
  AdvancedConsoleLogger,
  Logger as TypeOrmLogger,
  LoggerOptions as TypeOrmLoggerOptions,
  QueryRunner,
} from 'typeorm'
import {
  config,
  format,
  Logger,
  LoggerOptions,
  loggers,
  transports,
} from 'winston'
import TransportStream from 'winston-transport'
import { ConsoleTransportOptions } from 'winston/lib/winston/transports'
import { env } from '../env'

export class CustomTypeOrmLogger
  extends AdvancedConsoleLogger
  implements TypeOrmLogger
{
  private logger: Logger

  constructor(options?: TypeOrmLoggerOptions) {
    super(options)
    this.logger = logger
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    this.logger.info(query, {
      isReplicated: queryRunner?.connection?.driver?.isReplicated,
      parameters,
    })
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    queryRunner?: QueryRunner
  ): void {
    if (level === 'warn') {
      this.logger.log('warning', message)
      return
    }

    this.logger.info(message)
  }
}

const colors = {
  emerg: 'inverse underline magenta',
  alert: 'underline magenta',
  crit: 'inverse underline red', // Any error that is forcing a shutdown of the service or application to prevent data loss.
  error: 'underline red', // Any error which is fatal to the operation, but not the service or application
  warning: 'underline yellow', // Anything that can potentially cause application oddities
  notice: 'underline cyan', // Normal but significant condition
  info: 'underline green', // Generally useful information to log
  debug: 'underline gray',
}

const MAX_LOG_SIZE = 250000

const googleConfigs = {
  level: 'info',
  logName: 'logger',
  levels: config.syslog.levels,
  maxEntrySize: MAX_LOG_SIZE,
  useMessageField: false,
  redirectToStdout: true,
}

function localConfig(id: string): ConsoleTransportOptions {
  return {
    level: 'debug',
    format: format.combine(
      format.colorize({ all: true, colors }),
      format((info) =>
        Object.assign(info, {
          timestamp: DateTime.local().toLocaleString(
            DateTime.TIME_24_WITH_SECONDS
          ),
        })
      )(),
      format.printf((info) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { timestamp, message, level, ...meta } = info

        return `[${id}@${info.timestamp}] ${info.message}${
          Object.keys(meta).length
            ? '\n' + jsonStringify(meta, undefined, 4)
            : ''
        }`
      })
    ),
  }
}

// truncate any string values in the object to a given length
const truncateObjectDeep = (object: any, length: number): any => {
  const copyObj = cloneDeep(object) as never

  const truncateDeep = (obj: any, level: number): any => {
    // reach maximum call stack size
    if (level >= 5) {
      return undefined
    }

    if (isString(obj) && obj.length > length) {
      return `${truncate(obj, { length })} [truncated]`
    }

    if (isArray(obj)) {
      return obj.map((i) => truncateDeep(i, level + 1) as never)
    }

    if (isObject(obj)) {
      Object.entries(obj).forEach(([key, value]) => {
        obj[key as keyof typeof obj] = truncateDeep(value, level + 1) as never
      })

      return obj
    }

    // return everything else untouched
    return obj
  }

  return truncateDeep(copyObj, 1)
}

class GcpLoggingTransport extends LoggingWinston {
  log(info: any, callback: (err: Error | null, apiResponse?: any) => void) {
    // reduce the size of the log entry by truncating any string values to 10000 characters
    info = truncateObjectDeep(info, 10000) as never
    super.log(info, callback)
  }
}

/**
 * Builds a logger with common options, including a transport for GCP when running in the cloud.
 * @param id Name of the log stream.
 * @param options Logger Options
 */
export function buildLogger(id: string, options?: LoggerOptions): Logger {
  const opt = {
    ...options,
    ...{ levels: config.syslog.levels, transports: [buildLoggerTransport(id)] },
  }

  return loggers.get(id, opt)
}

export function buildLoggerTransport(id: string): TransportStream {
  return env.dev.isLocal
    ? new transports.Console(localConfig(id))
    : new GcpLoggingTransport({ ...googleConfigs, ...{ logName: id } })
}

/**
 * A handy open-ended structure for logging.
 */
export interface LogRecord {
  labels?: {
    [key: string]: any
    source: string
  }
  [key: string]: any
}

export const logError = (error: any): void => {
  if (axios.isAxiosError(error)) {
    logger.error(error.message, {
      response: error.response?.data,
      stack: error.stack,
    })
  } else if (error instanceof Error) {
    logger.error(error.message, { stack: error.stack })
  } else {
    logger.error(error)
  }
}

export const logger = buildLogger('app')

export default {}
