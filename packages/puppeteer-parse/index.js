/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const Url = require('url');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const signToken = promisify(jwt.sign);
const { config, format, loggers, transports } = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const { DateTime } = require('luxon');
const os = require('os');
const Sentry = require('@sentry/serverless');
const { Storage } = require('@google-cloud/storage');
const { appleNewsHandler } = require('./apple-news-handler');
const { twitterHandler } = require('./twitter-handler');
const { youtubeHandler } = require('./youtube-handler');
const { tDotCoHandler } = require('./t-dot-co-handler');
const { pdfHandler } = require('./pdf-handler');
const { mediumHandler } = require('./medium-handler');

const storage = new Storage();
const previewBucket = storage.bucket(process.env.PREVIEW_IMAGE_BUCKET);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(',');

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
});

const MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.62 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const BOT_DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const NON_BOT_DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const NON_BOT_HOSTS = ['bloomberg.com', 'forbes.com']

const filePath = `${os.tmpdir()}/previewImage.png`;
const ALLOWED_CONTENT_TYPES = ['text/html', 'application/octet-stream', 'text/plain', 'application/pdf'];


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

const userAgentForUrl = (url) => {
  try {
    const u = new URL(url);
    for (const host of NON_BOT_HOSTS) {
      if (u.hostname.endsWith(host)) {
        return NON_BOT_DESKTOP_USER_AGENT;
      }
    }
  } catch (e) {
    console.log('error getting user agent for url', url, e)
  }
  return DESKTOP_USER_AGENT
};

// launch Puppeteer
const getBrowserPromise = (async () => {
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: { height: 1080, width: 1920 },
    executablePath: process.env.CHROMIUM_PATH || (await chromium.executablePath),
    headless: process.env.IS_LOCAL ? false : chromium.headless,
    timeout: 0,
  });
})();

let logRecord, functionStartTime;

const uploadToSignedUrl = async ({ id, uploadSignedUrl }, contentType, contentObjUrl) => {
  const stream = await axios.get(contentObjUrl, { responseType: 'stream' });
  return await axios.put(uploadSignedUrl, stream.data, {
    headers: {
      'Content-Type': contentType,
    },
    maxBodyLength: 1000000000,
    maxContentLength: 100000000,
  })
};

const getUploadIdAndSignedUrl = async (userId, url) => {
  const auth = await signToken({ uid: userId }, process.env.JWT_SECRET);
  const data = JSON.stringify({
    query: `mutation UploadFileRequest($input: UploadFileRequestInput!) {
      uploadFileRequest(input:$input) {
        ... on UploadFileRequestError {
          errorCodes
        }
        ... on UploadFileRequestSuccess {
          id
          uploadSignedUrl
        }
      }
    }`,
    variables: {
      input: {
        url,
        contentType: 'application/pdf',
      }
    }
  });

  const response = await axios.post(`${process.env.REST_BACKEND_ENDPOINT}/graphql`, data,
  {
    headers: {
      Cookie: `auth=${auth};`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.data.uploadFileRequest;
};

const uploadPdf = async (url, userId) => {
  validateUrlString(url);

  const uploadResult = await getUploadIdAndSignedUrl(userId, url);
  await uploadToSignedUrl(uploadResult, 'application/pdf', url);
  return uploadResult.id;
};

const sendCreateArticleMutation = async (userId, input) => {
  const data = JSON.stringify({
    query: `mutation CreateArticle ($input: CreateArticleInput!){
          createArticle(input:$input){
            ... on CreateArticleSuccess{
              createdArticle{
                id
            }
        }
          ... on CreateArticleError{
              errorCodes
          }
      }
    }`,
    variables: {
      input: Object.assign({}, input , { source: 'puppeteer-parse' }),
    },
  });

  const auth = await signToken({ uid: userId }, process.env.JWT_SECRET);
  const response = await axios.post(`${process.env.REST_BACKEND_ENDPOINT}/graphql`, data,
  {
    headers: {
      Cookie: `auth=${auth};`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.data.createArticle;
};

const saveUploadedPdf = async (userId, url, uploadFileId, articleSavingRequestId) => {
  return sendCreateArticleMutation(userId, {
      url: encodeURI(url),
      articleSavingRequestId,
      uploadFileId: uploadFileId,
    },
  );
};

const handlers = {
  'pdf': pdfHandler,
  'apple-news': appleNewsHandler,
  'twitter': twitterHandler,
  'youtube': youtubeHandler,
  't-dot-co': tDotCoHandler,
  'medium': mediumHandler,
};

/**
 * Cloud Function entry point, HTTP trigger.
 * Loads the requested URL via Puppeteer, captures page content and sends it to backend
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.puppeteer = Sentry.GCPFunction.wrapHttpFunction(async (req, res) => {
  functionStartTime = Date.now();
  // Grabbing execution and trace ids to attach logs to the appropriate function call
  const execution_id = req.get('function-execution-id');
  const traceId = (req.get('x-cloud-trace-context') || '').split('/')[0];
  const logger = buildLogger('cloudfunctions.googleapis.com%2Fcloud-functions', {
    trace: `projects/${process.env.GCLOUD_PROJECT}/traces/${traceId}`,
    labels: {
      execution_id: execution_id,
    },
  });

  let url = getUrl(req);
  const userId = req.body.userId || req.query.userId;
  const articleSavingRequestId = req.body.saveRequestId || req.query.saveRequestId;

  logRecord = {
    url,
    userId,
    articleSavingRequestId,
    labels: {
      source: 'parseContent',
    },
  };

  logger.info(`Article parsing request`, logRecord);

  if (!url) {
    logRecord.urlIsInvalid = true;
    logger.error(`Valid URL to parse not specified`, logRecord);
    return res.sendStatus(400);
  }

  if (!userId || !articleSavingRequestId) {
    Object.assign(logRecord, { invalidParams: true, body: req.body, query: req.query });
    logger.error(`Invalid parameters`, logRecord);
    return res.sendStatus(400);
  }

  // Before we run the regular handlers we check to see if we need tp
  // pre-resolve the URL. TODO: This should probably happen recursively,
  // so URLs can be pre-resolved, handled, pre-resolved, handled, etc.
  for (const [key, handler] of Object.entries(handlers)) {
    if (handler.shouldResolve && handler.shouldResolve(url)) {
      try {
        url = await handler.resolve(url);
        validateUrlString(url);
      } catch (err) {
        console.log('error resolving url with handler', key, err);
      }
      break;
    }
  }

  // Before we fetch the page we check the handlers, to see if they want
  // to perform a prefetch action that can modify our requests.
  // enumerate the handlers and see if any of them want to handle the request
  const handler = Object.keys(handlers).find(key => {
    try {
      return handlers[key].shouldPrehandle(url)
    } catch (e) {
      console.log('error with handler: ', key, e);
    }
    return false;
  });

  var title = undefined;
  var content = undefined;
  var contentType = undefined;

  if (handler) {
    try {
      // The only handler we have now can modify the URL, but in the
      // future maybe we let it modify content. In that case
      // we might exit the request early.
      console.log('pre-handling url with handler: ', handler);

      const result = await handlers[handler].prehandle(url);
      if (result && result.url) { 
        url = result.url
        validateUrlString(url);
      }
      if (result && result.title) { title = result.title }
      if (result && result.content) { content = result.content }
      if (result && result.contentType) { contentType = result.contentType }
    } catch (e) {
      console.log('error with handler: ', handler, e);
    }
  }

  var context, page, finalUrl;
  if ((!content || !title) && contentType !== 'application/pdf') {
    const result = await retrievePage(url)
    if (result && result.context) { context = result.context }
    if (result && result.page) { page = result.page }
    if (result && result.finalUrl) { finalUrl = result.finalUrl }
    if (result && result.contentType) { contentType = result.contentType }
    console.log('context, page, finalUrl, contentType', context, page, finalUrl, contentType);
  } else {
    finalUrl = url
  }

  try {
    if (contentType === 'application/pdf') {
      const uploadedFileId = await uploadPdf(finalUrl, userId);
      const l = await saveUploadedPdf(userId, finalUrl, uploadedFileId, articleSavingRequestId);
    } else {
      if (!content || !title) {
        const result = await retrieveHtml(page);
        title = result.title;
        content = result.domContent;
      } else {
        console.log('using prefetched content and title');
        console.log(content);
      }

      const apiResponse = await sendCreateArticleMutation(userId, {
        url: finalUrl,
        articleSavingRequestId,
        preparedDocument: {
          document: content,
          pageInfo: {
            title,
            canonicalUrl: finalUrl,
          },
        },
        skipParsing: !content,
      });

      logRecord.result = apiResponse.createArticle;
      logger.info(`parse-page`, logRecord);
    }
  } catch (e) {
    console.log('error', e)
    logRecord.error = e.message;
    logger.error(`Error while retrieving page`, logRecord);
    return res.sendStatus(503);
  } finally {
    if (context) {
      await context.close();
    }
  }

  return res.sendStatus(200);
});

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
  functionStartTime = Date.now();
  // Grabbing execution and trace ids to attach logs to the appropriate function call
  const execution_id = req.get('function-execution-id');
  const traceId = (req.get('x-cloud-trace-context') || '').split('/')[0];
  const logger = buildLogger('cloudfunctions.googleapis.com%2Fcloud-functions', {
    trace: `projects/${process.env.GCLOUD_PROJECT}/traces/${traceId}`,
    labels: {
      execution_id: execution_id,
    },
  });

  const url = getUrl(req);
  console.log('preview request url', url);

  logRecord = {
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

  const browser = await getBrowserPromise;
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

function validateUrlString(url) {
  const u = new URL(url);
  // Make sure the URL is http or https
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Invalid URL protocol check failed')
  }
  // Make sure the domain is not localhost
  if (u.hostname === 'localhost' || u.hostname === '0.0.0.0') {
    throw new Error('Invalid URL is localhost')
  }
  // Make sure the domain is not a private IP
  if (/^(10|172\.16|192\.168)\..*/.test(u.hostname)) {
    throw new Error('Invalid URL is private ip')
  }
}

function getUrl(req) {
  if (req.query.url || req.body.url) {
    const urlStr = req.query.url || req.body.url;
    validateUrlString(urlStr);

    const url = Url.parse(urlStr);
    return url.href;
  }
  try {
    return Url.parse(JSON.parse(req.body).url).href;
  } catch (e) {}
}

async function retrievePage(url) {
  validateUrlString(url);

  const browser = await getBrowserPromise;
  logRecord.timing = { ...logRecord.timing, browserOpened: Date.now() - functionStartTime };

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.setUserAgent(userAgentForUrl(url));

  const client = await page.target().createCDPSession();

  // intercept request when response headers was received
  await client.send('Network.setRequestInterception', {
    patterns: [
      {
        urlPattern: '*',
        resourceType: 'Document',
        interceptionStage: 'HeadersReceived',
      },
    ],
  });

  const path = require('path');
  const download_path = path.resolve('./download_dir/');

  await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      userDataDir: './',
      downloadPath: download_path,
  })

  client.on('Network.requestIntercepted', async e => {
    const headers = e.responseHeaders || {};

    const [contentType] = (headers['content-type'] || headers['Content-Type'] || '')
      .toLowerCase()
      .split(';');
    const obj = { interceptionId: e.interceptionId };

    if (e.responseStatusCode >= 200 && e.responseStatusCode < 300) {
      // We only check content-type on success responses
      // as it doesn't matter what the content type is for things
      // like redirects
      if (contentType && !ALLOWED_CONTENT_TYPES.includes(contentType)) {
        obj['errorReason'] = 'BlockedByClient';
      }
    }

    try {
      await client.send('Network.continueInterceptedRequest', obj);
      // eslint-disable-next-line no-empty
    } catch {}
  });

  /*
    * Disallow MathJax from running in Puppeteer and modifying the document,
    * we shall instead run it in our frontend application to transform any
    * mathjax content when present.
    */
  await page.setRequestInterception(true);
  let requestCount = 0;
  page.on('request', request => {
    if (requestCount++ > 100) {
      request.abort();
      return;
    }
    if (
      request.resourceType() === 'script' &&
      request.url().toLowerCase().indexOf('mathjax') > -1
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // Puppeteer fails during download of PDf files,
  // so record the failure and use those items
  let lastPdfUrl = undefined;
  page.on('response', response => {
    if (response.headers()['content-type'] === 'application/pdf') {
      lastPdfUrl = response.url();
    }
  });

  try {
    const response = await page.goto(url, { waitUntil: ['networkidle2'] });
    const finalUrl = response.url();
    const contentType = response.headers()['content-type'];

    logRecord.finalUrl = response.url();
    logRecord.contentType = response.headers()['content-type'];

    return { context, page, response, finalUrl: finalUrl, contentType: contentType };
  } catch (error) {
    if (lastPdfUrl) {
      return { context, page, finalUrl: lastPdfUrl, contentType: 'application/pdf' };
    }
    throw error;
  }
}

async function retrieveHtml(page) {
  let domContent = '', title;
  try {
    title = await page.title();
    logRecord.title = title;

    const pageScrollingStart = Date.now();
    /* scroll with a 5 second timeout */
    await Promise.race([
      new Promise(resolve => {
        (async function () {
          try {
            await page.evaluate(`(async () => {
                /* credit: https://github.com/puppeteer/puppeteer/issues/305 */
                return new Promise((resolve, reject) => {
                  let scrollHeight = document.body.scrollHeight;
                  let totalHeight = 0;
                  let distance = 500;
                  let timer = setInterval(() => {
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if(totalHeight >= scrollHeight){
                      clearInterval(timer);
                      resolve(true);
                    }
                  }, 10);
                });
              })()`);
          } catch (e) {
            logRecord.scrollError = true;
          } finally {
            resolve(true);
          }
        })();
      }),
      page.waitForTimeout(5000), //5 second timeout
    ]);
    logRecord.timing = { ...logRecord.timing, pageScrolled: Date.now() - pageScrollingStart };

    const iframes = {};
    const urls = [];
    const framesPromises = [];
    const allowedUrls = /instagram\.com/gi;

    for (const frame of page.mainFrame().childFrames()) {
      if (frame.url() && allowedUrls.test(frame.url())) {
        urls.push(frame.url());
        framesPromises.push(frame.evaluate(el => el.innerHTML, await frame.$('body')));
      }
    }

    (await Promise.all(framesPromises)).forEach((frame, index) => (iframes[urls[index]] = frame));

    const domContentCapturingStart = Date.now();
    // get document body with all hidden elements removed
    domContent = await page.evaluate(iframes => {
      const BI_SRC_REGEXP = /url\("(.+?)"\)/gi;

      Array.from(document.body.getElementsByTagName('*')).forEach(el => {
        const style = window.getComputedStyle(el);

        // Removing blurred images since they are mostly the copies of lazy loaded ones
        if (['img', 'image'].includes(el.tagName.toLowerCase())) {
          const filter = style.getPropertyValue('filter');
          if (filter && filter.startsWith('blur')) {
            el.parentNode && el.parentNode.removeChild(el);
          }
        }

        // convert all nodes with background image to img nodes
        if (!['', 'none'].includes(style.getPropertyValue('background-image'))) {
          const filter = style.getPropertyValue('filter');
          // avoiding image nodes with a blur effect creation
          if (filter && filter.startsWith('blur')) {
            el && el.parentNode && el.parentNode.removeChild(el);
          } else {
            const matchedSRC = BI_SRC_REGEXP.exec(style.getPropertyValue('background-image'));
            // Using "g" flag with a regex we have to manually break down lastIndex to zero after every usage
            // More details here: https://stackoverflow.com/questions/1520800/why-does-a-regexp-with-global-flag-give-wrong-results
            BI_SRC_REGEXP.lastIndex = 0;

            if (matchedSRC && matchedSRC[1] && !el.src) {
              // Replacing element only of there are no content inside, b/c might remove important div with content.
              // Article example: http://www.josiahzayner.com/2017/01/genetic-designer-part-i.html
              // DIV with class "content-inner" has `url("https://resources.blogblog.com/blogblog/data/1kt/travel/bg_container.png")` background image.
              if (el.innerHTML.length < 25) {
                const img = document.createElement('img');
                img.src = matchedSRC[1];
                el && el.parentNode && el.parentNode.removeChild(el);
              }
            }
          }
        }

        if (el.tagName === 'IFRAME') {
          if (iframes[el.src]) {
            const newNode = document.createElement('div');
            newNode.className = 'omnivore-instagram-embed';
            newNode.innerHTML = iframes[el.src];
            el && el.parentNode && el.parentNode.replaceChild(newNode, el);
          }
        }
      });
      return document.documentElement.innerHTML;
    }, iframes);
    logRecord.puppeteerSuccess = true;
    logRecord.timing = {
      ...logRecord.timing,
      contenCaptured: Date.now() - domContentCapturingStart,
    };

    // [END puppeteer-block]
  } catch (e) {
    if (e.message.startsWith('net::ERR_BLOCKED_BY_CLIENT at ')) {
      logRecord.blockedByClient = true;
    } else {
      logRecord.puppeteerSuccess = false;
      logRecord.puppeteerError = {
        message: e.message,
        stack: e.stack,
      };
    }
  }
  return { domContent, title };
}
