/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const Url = require('url');
const puppeteer = require('puppeteer-extra');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const signToken = promisify(jwt.sign);
const { appleNewsHandler } = require('./apple-news-handler');
const { twitterHandler } = require('./twitter-handler');
const { youtubeHandler } = require('./youtube-handler');
const { tDotCoHandler } = require('./t-dot-co-handler');
const { pdfHandler } = require('./pdf-handler');
const { mediumHandler } = require('./medium-handler');
const { derstandardHandler } = require('./derstandard-handler');
const { imageHandler } = require('./image-handler');

const MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.62 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const BOT_DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const NON_BOT_DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const NON_BOT_HOSTS = ['bloomberg.com', 'forbes.com']
const NON_SCRIPT_HOSTS= ['medium.com', 'fastcompany.com'];

const ALLOWED_CONTENT_TYPES = ['text/html', 'application/octet-stream', 'text/plain', 'application/pdf'];

const { parseHTML } = require('linkedom');

// Add stealth plugin to hide puppeteer usage
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


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
  const response = await axios.get('https://app.scrapingbee.com/api/v1', {
    params: {
      'api_key':  process.env.SCRAPINGBEE_API_KEY,
      'url': url,
      'render_js': 'false',
      'premium_proxy': 'true',
      'country_code':'us'
    }
  })

  const dom = parseHTML(response.data).document;
  return { title: dom.title, domContent: dom.documentElement.outerHTML, url: url }
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
    executablePath: process.env.CHROMIUM_PATH ,
    headless: true,
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

  const response = await axios.post(`${process.env.REST_BACKEND_ENDPOINT}/graphql`, data,
  {
    headers: {
      Cookie: `auth=${auth};`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.data.uploadFileRequest;
};

const uploadPdf = async (url, userId, articleSavingRequestId) => {
  validateUrlString(url);

  const uploadResult = await getUploadIdAndSignedUrl(userId, url, articleSavingRequestId);
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
  'derstandard': derstandardHandler,
  'image': imageHandler,
};


async function fetchContent(req, res) {
  functionStartTime = Date.now();

  let url = getUrl(req);
  const userId = (req.query ? req.query.userId : undefined) || (req.body ? req.body.userId : undefined);
  const articleSavingRequestId = (req.query ? req.query.saveRequestId : undefined) || (req.body ? req.body.saveRequestId : undefined);

  console.log('user id', userId, 'url', url)

  logRecord = {
    url,
    userId,
    articleSavingRequestId,
    labels: {
      source: 'parseContent',
    },
  };

  console.log(`Article parsing request`, logRecord);

  if (!url) {
    logRecord.urlIsInvalid = true;
    console.log(`Valid URL to parse not specified`, logRecord);
    return res.sendStatus(400);
  }

  // if (!userId || !articleSavingRequestId) {
  //   Object.assign(logRecord, { invalidParams: true, body: req.body, query: req.query });
  //   console.log(`Invalid parameters`, logRecord);
  //   return res.sendStatus(400);
  // }

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
  } else {
    finalUrl = url
  }

  try {
    if (contentType === 'application/pdf') {
      const uploadedFileId = await uploadPdf(finalUrl, userId, articleSavingRequestId);
      const l = await saveUploadedPdf(userId, finalUrl, uploadedFileId, articleSavingRequestId);
    } else {
      if (!content || !title) {
        const result = await retrieveHtml(page);
        if (result.isBlocked) {
          const sbResult = await fetchContentWithScrapingBee(url)
          title = sbResult.title
          content = sbResult.domContent
        } else {
          title = result.title;
          content = result.domContent;
        }
      } else {
        console.log('using prefetched content and title');
        console.log(content);
      }

      logRecord.fetchContentTime = Date.now() - functionStartTime;

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

      logRecord.totalTime = Date.now() - functionStartTime;
      logRecord.result = apiResponse.createArticle;
      console.log(`parse-page`, logRecord);
    }
  } catch (e) {
    console.log('error', e)
    logRecord.error = e.message;
    console.log(`Error while retrieving page`, logRecord);
    return res.sendStatus(503);
  } finally {
    if (context) {
      await context.close();
    }
  }

  return res.sendStatus(200);
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

function getUrl(req) {
  console.log('body', req.body)
  const urlStr = (req.query ? req.query.url : undefined) || (req.body ? req.body.url : undefined);
  if (!urlStr) {
    throw new Error('No URL specified');
  }

  validateUrlString(urlStr);

  const parsed = Url.parse(urlStr);
  return parsed.href;
}


async function blockResources(client) {
  const blockedResources = [
    // Assets
    // '*/favicon.ico',
    // '.css',
    // '.jpg',
    // '.jpeg',
    // '.png',
    // '.svg',
    // '.woff',

    // Analytics and other fluff
    '*.optimizely.com',
    'everesttech.net',
    'userzoom.com',
    'doubleclick.net',
    'googleadservices.com',
    'adservice.google.com/*',
    'connect.facebook.com',
    'connect.facebook.net',
    'sp.analytics.yahoo.com',
  ]

  await client.send('Network.setBlockedURLs', { urls: blockedResources });
}

async function retrievePage(url) {
  validateUrlString(url);

  const browser = await getBrowserPromise;
  logRecord.timing = { ...logRecord.timing, browserOpened: Date.now() - functionStartTime };

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage()

  if (!enableJavascriptForUrl(url)) {
    await page.setJavaScriptEnabled(false);
  }
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

  await blockResources(client);

  /*
    * Disallow MathJax from running in Puppeteer and modifying the document,
    * we shall instead run it in our frontend application to transform any
    * mathjax content when present.
    */
  await page.setRequestInterception(true);
  let requestCount = 0;
  page.on('request', request => {
    if (['font', 'image', 'media'].includes(request.resourceType())) {
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
    const response = await page.goto(url, { waitUntil: ['networkidle2'] });
    const finalUrl = response.url();
    const contentType = response.headers()['content-type'];

    logRecord.finalUrl = response.url();
    logRecord.contentType = response.headers()['content-type'];

    return { context, page, response, finalUrl, contentType };
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
      page.waitForTimeout(1000),
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
          if (['img', 'image'].includes(el.tagName.toLowerCase())) {
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

module.exports = fetchContent;
