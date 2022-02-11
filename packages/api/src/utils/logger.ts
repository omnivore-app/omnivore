/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  config,
  format,
  Logger,
  LoggerOptions,
  loggers,
  transports,
} from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'
import TransportStream = require('winston-transport')
import { DateTime } from 'luxon'
import { ConsoleTransportOptions } from 'winston/lib/winston/transports'
import { env } from '../env'

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

const googleConfigs = {
  level: 'info',
  logName: 'logger',
  levels: config.syslog.levels,
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
          Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 4) : ''
        }`
      })
    ),
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
    : new LoggingWinston({ ...googleConfigs, ...{ logName: id } })
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

export default {}
