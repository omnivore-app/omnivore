/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const { encode } = require("urlsafe-base64");
const crypto = require("crypto");

const Url = require('url');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const signToken = promisify(jwt.sign);
const os = require('os');
const { Storage } = require('@google-cloud/storage');
const { parseHTML } = require('linkedom');
const { preHandleContent, preParseContent } = require("@omnivore/content-handler");
const { Readability } = require("@omnivore/readability");

const puppeteer = require('puppeteer-extra');

// Add stealth plugin to hide puppeteer usage
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const createDOMPurify = require("dompurify");

const storage = new Storage();
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const previewBucket = process.env.PREVIEW_IMAGE_BUCKET ? storage.bucket(process.env.PREVIEW_IMAGE_BUCKET) : undefined;

const filePath = `${os.tmpdir()}/previewImage.png`;

const MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.62 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const BOT_DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const NON_BOT_DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const NON_BOT_HOSTS = ['bloomberg.com', 'forbes.com']
const NON_SCRIPT_HOSTS= ['medium.com', 'fastcompany.com'];

const ALLOWED_CONTENT_TYPES = ['text/html', 'application/octet-stream', 'text/plain', 'application/pdf'];

const IMPORTER_METRICS_COLLECTOR_URL = process.env.IMPORTER_METRICS_COLLECTOR_URL;

const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_COUNT = process.env.MAX_RETRY_COUNT || '1';

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

const fetchContentWithScrapingBee = async (url) => {
  try {
    const response = await axios.get('https://app.scrapingbee.com/api/v1', {
      params: {
        'api_key':  process.env.SCRAPINGBEE_API_KEY,
        'url': url,
        'render_js': 'false',
        'premium_proxy': 'true',
        'country_code':'us'
      },
      timeout: REQUEST_TIMEOUT,
    })
  
    const dom = parseHTML(response.data).document;
    return { title: dom.title, domContent: dom.documentElement.outerHTML, url }
  } catch (e) {
    console.error('error fetching with scrapingbee', e.message)

    return { title: url, domContent: '', url }
  }
}

const enableJavascriptForUrl = (url) => {
  try {
    const u = new URL(url);
    for (const host of NON_SCRIPT_HOSTS) {
      if (u.hostname.endsWith(host)) {
        return false;
      }
    }
  } catch (e) {
    console.log('error getting hostname for url', url, e)
  }
  return true
};

// launch Puppeteer
const getBrowserPromise = (async () => {
  console.log("starting with proxy url", process.env.PROXY_URL)
  return puppeteer.launch({
    args: [
      '--allow-running-insecure-content',
      '--autoplay-policy=user-gesture-required',
      '--disable-component-update',
      '--disable-domain-reliability',
      '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process',
      '--disable-print-preview',
      '--disable-setuid-sandbox',
      '--disable-site-isolation-trials',
      '--disable-speech-api',
      '--disable-web-security',
      '--disk-cache-size=33554432',
      '--enable-features=SharedArrayBuffer',
      '--hide-scrollbars',
      '--ignore-gpu-blocklist',
      '--in-process-gpu',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--use-gl=swiftshader',
      '--window-size=1920,1080',
    ].filter((item) => !!item),
    defaultViewport: { height: 1080, width: 1920 },
    executablePath: process.env.CHROMIUM_PATH,
    headless: !!process.env.LAUNCH_HEADLESS,
    timeout: 120000, // 2 minutes
  });
})();

const uploadToSignedUrl = async ({ id, uploadSignedUrl }, contentType, contentObjUrl) => {
  try {
    const stream = await axios.get(contentObjUrl, { responseType: 'stream' });
    return axios.put(uploadSignedUrl, stream.data, {
      headers: {
        'Content-Type': contentType,
      },
      maxBodyLength: 1000000000,
      maxContentLength: 100000000,
    });
  } catch (error) {
    console.error('error uploading to signed url', error.message);
    return null;
  }
};

const getUploadIdAndSignedUrl = async (userId, url, articleSavingRequestId) => {
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
        clientRequestId: articleSavingRequestId,
      }
    }
  });

  try {
    const response = await axios.post(`${process.env.REST_BACKEND_ENDPOINT}/graphql`, data,
    {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
      timeout: REQUEST_TIMEOUT,
    });

    if (response.data.data.uploadFileRequest.errorCodes && response.data.data.uploadFileRequest.errorCodes.length > 0) {
      console.error('Error while getting upload id and signed url', response.data.data.uploadFileRequest.errorCodes[0]);
      return null;
    }

    return response.data.data.uploadFileRequest;
  } catch (e) {
    console.error('error getting upload id and signed url', e.message);
    return null;
  }
};

const uploadPdf = async (url, userId, articleSavingRequestId) => {
  validateUrlString(url);

  const uploadResult = await getUploadIdAndSignedUrl(userId, url, articleSavingRequestId);
  if (!uploadResult) {
    throw new Error('error while getting upload id and signed url');
  }
  const uploaded = await uploadToSignedUrl(uploadResult, 'application/pdf', url);
  if (!uploaded) {
    throw new Error('error while uploading pdf');
  }
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
  try {
    const response = await axios.post(`${process.env.REST_BACKEND_ENDPOINT}/graphql`, data,
    {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
      timeout: REQUEST_TIMEOUT,
    });

    if (response.data.data.createArticle.errorCodes && response.data.data.createArticle.errorCodes.length > 0) {
      console.error('error while creating article', response.data.data.createArticle.errorCodes[0]);
      return null;
    }

    return response.data.data.createArticle;
  } catch (error) {
    console.error('error creating article', error.message);
    return null;
  }
};

const sendSavePageMutation = async (userId, input) => {
  const data = JSON.stringify({
    query: `mutation SavePage ($input: SavePageInput!){
          savePage(input:$input){
            ... on SaveSuccess{
              url
              clientRequestId
            }
            ... on SaveError{
                errorCodes
            }
          }
    }`,
    variables: {
      input: Object.assign({}, input , { source: 'puppeteer-parse' }),
    },
  });

  const auth = await signToken({ uid: userId }, process.env.JWT_SECRET);
  try {
    const response = await axios.post(`${process.env.REST_BACKEND_ENDPOINT}/graphql`, data,
    {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
      timeout: REQUEST_TIMEOUT,
    });

    if (response.data.data.savePage.errorCodes && response.data.data.savePage.errorCodes.length > 0) {
      console.error('error while saving page', response.data.data.savePage.errorCodes[0]);
      return null;
    }

    return response.data.data.savePage;
  } catch (error) {
    console.error('error saving page', error.message);
    return null;
  }
};

const saveUploadedPdf = async (userId, url, uploadFileId, articleSavingRequestId) => {
  return sendCreateArticleMutation(userId, {
      url: encodeURI(url),
      articleSavingRequestId,
      uploadFileId: uploadFileId,
    },
  );
};

const sendImportStatusUpdate = async (userId, taskId, status) => {
  try {
    const auth = await signToken({ uid: userId }, process.env.JWT_SECRET);

    await axios.post(
      IMPORTER_METRICS_COLLECTOR_URL, 
      {
        taskId,
        status,
      },
      {
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      });
  } catch (e) {
    console.error('error while sending import status update', e);
  }
};

async function fetchContent(req, res) {
  let functionStartTime = Date.now();

  const userId = (req.query ? req.query.userId : undefined) || (req.body ? req.body.userId : undefined);
  const articleSavingRequestId = (req.query ? req.query.saveRequestId : undefined) || (req.body ? req.body.saveRequestId : undefined);
  const state = req.body.state
  const labels = req.body.labels
  const source = req.body.source || 'parseContent';
  const taskId = req.body.taskId; // taskId is used to update import status
  const urlStr = (req.query ? req.query.url : undefined) || (req.body ? req.body.url : undefined);
  const locale = (req.query ? req.query.locale : undefined) || (req.body ? req.body.locale : undefined);
  const timezone = (req.query ? req.query.timezone : undefined) || (req.body ? req.body.timezone : undefined);

  let logRecord = {
    url: urlStr,
    userId,
    articleSavingRequestId,
    labels: {
      source,
    },
    state,
    labelsToAdd: labels,
    taskId: taskId,
    locale,
    timezone,
  };

  console.info(`Article parsing request`, logRecord);

  let url, context, page, finalUrl, title, content, contentType, importStatus, statusCode = 200;
  try {
    url = getUrl(urlStr);
    if (!url) {
      logRecord.urlIsInvalid = true;
      logRecord.error = 'Valid URL to parse not specified';
      statusCode = 400;
      return;
    }

    // pre handle url with custom handlers
    try {
      const browser = await getBrowserPromise;
      const result = await preHandleContent(url, browser);
      if (result && result.url) {
        validateUrlString(url);
        url = result.url;
      }
      if (result && result.title) { title = result.title }
      if (result && result.content) { content = result.content }
      if (result && result.contentType) { contentType = result.contentType }
    } catch (e) {
      console.info('error with handler: ', e);
    }

    if ((!content || !title) && contentType !== 'application/pdf') {
      const result = await retrievePage(url, logRecord, functionStartTime, locale, timezone);
      if (result && result.context) { context = result.context }
      if (result && result.page) { page = result.page }
      if (result && result.finalUrl) { finalUrl = result.finalUrl }
      if (result && result.contentType) { contentType = result.contentType }
    } else {
      finalUrl = url
    }

    if (contentType === 'application/pdf') {
      const uploadedFileId = await uploadPdf(finalUrl, userId, articleSavingRequestId);
      const uploadedPdf = await saveUploadedPdf(userId, finalUrl, uploadedFileId, articleSavingRequestId);
      if (!uploadedPdf) {
        statusCode = 500;
        logRecord.error = 'error while saving uploaded pdf';
      } else {
        importStatus = 'imported';
      }
    } else {
      if (!content || !title) {
        const result = await retrieveHtml(page, logRecord);
        if (result.isBlocked) {
          const sbResult = await fetchContentWithScrapingBee(url)
          title = sbResult.title
          content = sbResult.domContent
        } else {
          title = result.title;
          content = result.domContent;
        }
      } else {
        console.info('using prefetched content and title');
      }
      logRecord.fetchContentTime = Date.now() - functionStartTime;
    }
  } catch (e) {
    logRecord.error = e.message;
    console.error(`Error while retrieving page`, logRecord);

    // fallback to scrapingbee for non pdf content
    if (url && contentType !== 'application/pdf') {
      console.info('fallback to scrapingbee', url);

      const fetchStartTime = Date.now();
      const sbResult = await fetchContentWithScrapingBee(url);
      content = sbResult.domContent;
      title = sbResult.title;
      logRecord.fetchContentTime = Date.now() - fetchStartTime;
    }
  } finally {
    // close browser context if it was opened
    if (context) {
      await context.close();
    }
    // save non pdf content
    if (url && contentType !== 'application/pdf') {
      // parse content if it is not empty
      let readabilityResult = null;
      if (content) {
        let document = parseHTML(content).document;
        // preParse content
        const preParsedDom = await preParseContent(url, document)
        if (preParsedDom) {
          document = preParsedDom
        }
        readabilityResult = await getReadabilityResult(url, document);
      }
      
      const apiResponse = await sendSavePageMutation(userId, {
        url,
        clientRequestId: articleSavingRequestId,
        title,
        originalContent: content,
        parseResult: readabilityResult,
        state,
        labels,
      });
      if (!apiResponse) {
        logRecord.error = 'error while saving page';
        statusCode = 500;
      } else {
        importStatus = readabilityResult ? 'imported' : 'failed';
      }
    }

    logRecord.totalTime = Date.now() - functionStartTime;
    console.info(`parse-page`, logRecord);

    // mark import failed on the last failed retry
    const retryCount = req.headers['x-cloudtasks-taskretrycount'];
    if (retryCount == MAX_RETRY_COUNT) {
      console.debug('max retry count reached');
      importStatus = importStatus || 'failed';
    }

    // send import status to update the metrics
    if (taskId && importStatus) {
      await sendImportStatusUpdate(userId, taskId, importStatus);
    }

    res.sendStatus(statusCode);
  }
}

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

function tryParseUrl(urlStr) {
  if (!urlStr) {
    return null;
  }
  
  // a regular expression to match all URLs
  const regex = /(https?:\/\/[^\s]+)/g;
  
  const matches = urlStr.match(regex);
  
  if (matches) {
    return matches[0]; // only return first match
  } else {
    return null;
  }
}

function getUrl(urlStr) {
  const url = tryParseUrl(urlStr)
  if (!url) {
    throw new Error('No URL specified');
  }

  validateUrlString(url);

  const parsed = Url.parse(url);
  return parsed.href;
}

async function retrievePage(url, logRecord, functionStartTime, locale, timezone) {
  validateUrlString(url);

  const browser = await getBrowserPromise;
  logRecord.timing = { ...logRecord.timing, browserOpened: Date.now() - functionStartTime };

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage()

  if (!enableJavascriptForUrl(url)) {
    await page.setJavaScriptEnabled(false);
  }
  await page.setUserAgent(userAgentForUrl(url));

  // set locale for the page
  if (locale) {
    await page.setExtraHTTPHeaders({ 'Accept-Language': locale });
  }

  // set timezone for the page
  if (timezone) {
    await page.emulateTimezone(timezone);
  }

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

  await client.send('Page.setDownloadBehavior', {
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
    if (request.resourceType() === 'font') {
      // Disallow fonts from loading
      request.abort();
      return;
    }
    if (requestCount++ > 100) {
      request.abort();
      return;
    }
    if (
      request.resourceType() === 'script' &&
      request.url().toLowerCase().indexOf('mathjax') > -1
    ) {
      request.abort();
      return
    }
    request.continue();
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
    const response = await page.goto(url, { timeout: 30 * 1000, waitUntil: ['networkidle2'] });
    const finalUrl = response.url();
    const contentType = response.headers()['content-type'];

    logRecord.finalUrl = response.url();
    logRecord.contentType = response.headers()['content-type'];

    return { context, page, response, finalUrl, contentType };
  } catch (error) {
    if (lastPdfUrl) {
      return { context, page, finalUrl: lastPdfUrl, contentType: 'application/pdf' };
    }
    await context.close();
    throw error;
  }
}

async function retrieveHtml(page, logRecord) {
  let domContent = '', title;
  try {
    title = await page.title();
    logRecord.title = title;

    const pageScrollingStart = Date.now();
    /* scroll with a 5 seconds timeout */
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
      page.waitForTimeout(5000),
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

        try {
          // Removing blurred images since they are mostly the copies of lazy loaded ones
          if (el.tagName && ['img', 'image'].includes(el.tagName.toLowerCase())) {
            const filter = style.getPropertyValue('filter');
            if (filter && filter.startsWith('blur')) {
              el.parentNode && el.parentNode.removeChild(el);
            }
          }
        } catch (err) {
          // throw Error('error with element: ' + JSON.stringify(Array.from(document.body.getElementsByTagName('*'))))
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
              if (!el.textContent) {
                const img = document.createElement('img');
                img.src = matchedSRC[1];
                el && el.parentNode && el.parentNode.replaceChild(img, el);
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

      if (document.querySelector('[data-translate="managed_checking_msg"]') ||
        document.getElementById('px-block-form-wrapper')) {
        return 'IS_BLOCKED'
      }

      return document.documentElement.outerHTML;
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
  if (domContent === 'IS_BLOCKED') {
    return { isBlocked: true };
  }
  return { domContent, title };
}

async function preview(req, res) {
  const functionStartTime = Date.now();
  // Grabbing execution and trace ids to attach logs to the appropriate function call
  const execution_id = req.get('function-execution-id');
  const traceId = (req.get('x-cloud-trace-context') || '').split('/')[0];
  const console = buildconsole('cloudfunctions.googleapis.com%2Fcloud-functions', {
    trace: `projects/${process.env.GCLOUD_PROJECT}/traces/${traceId}`,
    labels: {
      execution_id: execution_id,
    },
  });

  if (!process.env.PREVIEW_IMAGE_BUCKET) {
    console.error(`PREVIEW_IMAGE_BUCKET not set`)
    return res.sendStatus(500);
  }

  const urlStr = (req.query ? req.query.url : undefined) || (req.body ? req.body.url : undefined);
  const url = getUrl(urlStr);
  console.log('preview request url', url);

  const logRecord = {
    url,
    query: req.query,
    origin: req.get('Origin'),
    labels: {
      source: 'publicImagePreview',
    },
  };

  console.info(`Public preview image generation request`, logRecord);

  if (!url) {
    logRecord.urlIsInvalid = true;
    console.error(`Valid URL to parse is not specified`, logRecord);
    return res.sendStatus(400);
  }
  const { origin } = new URL(url);
  if (!ALLOWED_ORIGINS.some(o => o === origin)) {
    logRecord.forbiddenOrigin = true;
    console.error(`This origin is not allowed: ${origin}`, logRecord);
    return res.sendStatus(400);
  }

  const browser = await getBrowserPromise;
  logRecord.timing = { ...logRecord.timing, browserOpened: Date.now() - functionStartTime };

  const page = await browser.newPage();
  const pageLoadingStart = Date.now();
  const modifiedUrl = new URL(url);
  modifiedUrl.searchParams.append('fontSize', '24');
  modifiedUrl.searchParams.append('adjustAspectRatio', '1.91');
  try {
    await page.goto(modifiedUrl.toString());
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
    console.error(`Valid element selector is not specified`, logRecord);
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
    console.error(`Valid file destination is not specified`, logRecord);
    await page.close();
    return res.sendStatus(400);
  }
  logRecord.destination = destination;

  const screenshotTakingStart = Date.now();
  try {
    await page.waitForSelector(selector, { timeout: 3000 }); // wait for the selector to load
  } catch (error) {
    logRecord.elementNotFound = true;
    console.error(`Element is not presented on the page`, logRecord);
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

  console.info(`preview-image`, logRecord);
  return res.redirect(`${process.env.PREVIEW_IMAGE_CDN_ORIGIN}/${destination}`);
}

const DOM_PURIFY_CONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  FORBID_ATTR: [
    'data-ml-dynamic',
    'data-ml-dynamic-type',
    'data-orig-url',
    'data-ml-id',
    'data-ml',
    'data-xid',
    'data-feature',
  ],
}

function domPurifySanitizeHook(node, data) {
  if (data.tagName === 'iframe') {
    const urlRegex = /^(https?:)?\/\/www\.youtube(-nocookie)?\.com\/embed\//i
    const src = node.getAttribute('src') || ''
    const dataSrc = node.getAttribute('data-src') || ''

    if (src && urlRegex.test(src)) {
      return
    }

    if (dataSrc && urlRegex.test(dataSrc)) {
      node.setAttribute('src', dataSrc)
      return
    }

    node.parentNode?.removeChild(node)
  }
}

function getPurifiedContent(html) {
  const newWindow = parseHTML('')
  const DOMPurify = createDOMPurify(newWindow)
  DOMPurify.addHook('uponSanitizeElement', domPurifySanitizeHook)
  const clean = DOMPurify.sanitize(html, DOM_PURIFY_CONFIG)
  return parseHTML(clean).document
}

function signImageProxyUrl(url) {
  return encode(
    crypto.createHmac('sha256', process.env.IMAGE_PROXY_SECRET).update(url).digest()
  )
}

function createImageProxyUrl(url, width = 0, height = 0) {
  if (!process.env.IMAGE_PROXY_URL || !process.env.IMAGE_PROXY_SECRET) {
    return url
  }

  const urlWithOptions = `${url}#${width}x${height}`
  const signature = signImageProxyUrl(urlWithOptions)

  return `${process.env.IMAGE_PROXY_URL}/${width}x${height},s${signature}/${url}`
}

async function getReadabilityResult(url, document) {
  // First attempt to read the article as is.
  // if that fails attempt to purify then read
  const sources = [
    () => {
      return document
    },
    () => {
      return getPurifiedContent(document)
    },
  ]

  for (const source of sources) {
    const document = source()
    if (!document) {
      continue
    }

    try {
      const article = await new Readability(document, {
        createImageProxyUrl,
        url,
      }).parse()

      if (article) {
        return article
      }
    } catch (error) {
      console.log('parsing error for url', url, error)
    }
  }

  return null
}

module.exports = {
  fetchContent,
  preview,
};

