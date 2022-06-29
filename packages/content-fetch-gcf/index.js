/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { config, format, loggers, transports } = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const { DateTime } = require('luxon');
const os = require('os');
const Sentry = require('@sentry/serverless');
const { Storage } = require('@google-cloud/storage');
const { fetchContent, getBrowserPromise, getUrl } = require("@omnivore/puppeteer-parse");

const storage = new Storage();
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const previewBucket = process.env.PREVIEW_IMAGE_BUCKET ? storage.bucket(process.env.PREVIEW_IMAGE_BUCKET) : undefined;

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
});

const filePath = `${os.tmpdir()}/previewImage.png`;

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

/**
 * Cloud Function entry point, HTTP trigger.
 * Loads the requested URL via Puppeteer, captures page content and sends it to backend
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.puppeteer = Sentry.GCPFunction.wrapHttpFunction(fetchContent);

/**
 * Cloud Function entry point, HTTP trigger.
 * Loads the requested URL via Puppeteer and captures a screenshot of the provided element
 *
 * @param {Object} req Cloud Function request context.
 * Inlcudes:
 *  * url - URL address of the page to open
 * @param {Object} res Cloud Function response context.
 */
exports.preview = Sentry.GCPFunction.wrapHttpFunction(async (req, res) => {
  const functionStartTime = Date.now();
  // Grabbing execution and trace ids to attach logs to the appropriate function call
  const execution_id = req.get('function-execution-id');
  const traceId = (req.get('x-cloud-trace-context') || '').split('/')[0];
  const logger = buildLogger('cloudfunctions.googleapis.com%2Fcloud-functions', {
    trace: `projects/${process.env.GCLOUD_PROJECT}/traces/${traceId}`,
    labels: {
      execution_id: execution_id,
    },
  });

  if (!process.env.PREVIEW_IMAGE_BUCKET) {
    logger.error(`PREVIEW_IMAGE_BUCKET not set`)
    return res.sendStatus(500);
  }

  const url = getUrl(req);
  console.log('preview request url', url);

  const logRecord = {
    url,
    query: req.query,
    origin: req.get('Origin'),
    labels: {
      source: 'publicImagePreview',
    },
  };

  logger.info(`Public preview image generation request`, logRecord);

  if (!url) {
    logRecord.urlIsInvalid = true;
    logger.error(`Valid URL to parse is not specified`, logRecord);
    return res.sendStatus(400);
  }
  const { origin } = new URL(url);
  if (!ALLOWED_ORIGINS.some(o => o === origin)) {
    logRecord.forbiddenOrigin = true;
    logger.error(`This origin is not allowed: ${origin}`, logRecord);
    return res.sendStatus(400);
  }

  const browser = await getBrowserPromise(process.env.PROXY_URL, process.env.CHROMIUM_PATH);
  logRecord.timing = { ...logRecord.timing, browserOpened: Date.now() - functionStartTime };

  const page = await browser.newPage();
  const pageLoadingStart = Date.now();
  const modifiedUrl = new URL(url);
  modifiedUrl.searchParams.append('fontSize', 24);
  modifiedUrl.searchParams.append('adjustAspectRatio', 1.91);
  try {
    await page.goto(modifiedUrl);
    logRecord.timing = { ...logRecord.timing, pageLoaded: Date.now() - pageLoadingStart };
  } catch (error) {
    console.log('error going to page: ', modifiedUrl)
    console.log(error)
    throw error
  }

  // We lookup the destination path from our own page content and avoid trusting any passed query params
  // selector - CSS selector of the element to get screenshot of
  const selector = decodeURIComponent(
    await page.$eval(
      "head > meta[name='omnivore:preview_image_selector']",
      element => element.content,
    ),
  );
  if (!selector) {
    logRecord.selectorIsInvalid = true;
    logger.error(`Valid element selector is not specified`, logRecord);
    await page.close();
    return res.sendStatus(400);
  }
  logRecord.selector = selector;

  // destination - destination pathname for the image to save with
  const destination = decodeURIComponent(
    await page.$eval(
      "head > meta[name='omnivore:preview_image_destination']",
      element => element.content,
    ),
  );
  if (!destination) {
    logRecord.destinationIsInvalid = true;
    logger.error(`Valid file destination is not specified`, logRecord);
    await page.close();
    return res.sendStatus(400);
  }
  logRecord.destination = destination;

  const screenshotTakingStart = Date.now();
  try {
    await page.waitForSelector(selector, { timeout: 3000 }); // wait for the selector to load
  } catch (error) {
    logRecord.elementNotFound = true;
    logger.error(`Element is not presented on the page`, logRecord);
    await page.close();
    return res.sendStatus(400);
  }
  const element = await page.$(selector);
  await element.screenshot({ path: filePath }); // take screenshot of the element in puppeteer
  logRecord.timing = { ...logRecord.timing, screenshotTaken: Date.now() - screenshotTakingStart };

  await page.close();

  try {
    const [file] = await previewBucket.upload(filePath, {
      destination,
      metadata: logRecord,
    });
    logRecord.file = file.metadata;
  } catch (e) {
    console.log('error uploading to bucket, this is non-fatal', e)
  }

  logger.info(`preview-image`, logRecord);
  return res.redirect(`${process.env.PREVIEW_IMAGE_CDN_ORIGIN}/${destination}`);
});
