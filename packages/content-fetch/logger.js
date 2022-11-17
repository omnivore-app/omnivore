const { config, format, loggers, transports } = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const { DateTime } = require('luxon');

const colors = {
  emerg: 'inverse underline magenta',
  alert: 'underline magenta',
  crit: 'inverse underline red', // Any error that is forcing a shutdown of the service or application to prevent data loss.
  error: 'underline red', // Any error which is fatal to the operation, but not the service or application
  warning: 'underline yellow', // Anything that can potentially cause application oddities
  notice: 'underline cyan', // Normal but significant condition
  info: 'underline green', // Generally useful information to log
  debug: 'underline gray',
};

const googleConfigs = {
  level: 'info',
  logName: 'logger',
  levels: config.syslog.levels,
  resource: {
    labels: {
      function_name: process.env.FUNCTION_TARGET,
      project_id: process.env.GCP_PROJECT,
    },
    type: 'cloud_function',
  },
};

function localConfig(id) {
  return {
    level: 'debug',
    format: format.combine(
      format.colorize({ all: true, colors }),
      format(info =>
        Object.assign(info, {
          timestamp: DateTime.local().toLocaleString(DateTime.TIME_24_WITH_SECONDS),
        }),
      )(),
      format.printf(info => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { timestamp, message, level, ...meta } = info;

        return `[${id}@${info.timestamp}] ${info.message}${
          Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 4) : ''
        }`;
      }),
    ),
  };
}

function buildLoggerTransport(id, options) {
  return process.env.IS_LOCAL
    ? new transports.Console(localConfig(id))
    : new LoggingWinston({ ...googleConfigs, ...{ logName: id }, ...options });
}

function buildLogger(id, options) {
  return loggers.get(id, {
    levels: config.syslog.levels,
    transports: [buildLoggerTransport(id, options)],
  });
}

module.exports = {
  buildLogger,
}
