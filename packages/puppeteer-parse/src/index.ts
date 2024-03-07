/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { preHandleContent } from '@omnivore/content-handler'
import axios from 'axios'
// const { Storage } = require('@google-cloud/storage');
import { parseHTML } from 'linkedom'
import path from 'path'
import { Browser, BrowserContext, Page, Protocol } from 'puppeteer-core'
import puppeteer from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import Url from 'url'

// Add stealth plugin to hide puppeteer usage
puppeteer.use(StealthPlugin())
// Add adblocker plugin to block all ads and trackers (saves bandwidth)
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

// const storage = new Storage();
// const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
//   ? process.env.ALLOWED_ORIGINS.split(',')
//   : []
// const previewBucket = process.env.PREVIEW_IMAGE_BUCKET ? storage.bucket(process.env.PREVIEW_IMAGE_BUCKET) : undefined;

// const filePath = `${os.tmpdir()}/previewImage.png`

// const MOBILE_USER_AGENT =
//   'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.62 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
// const BOT_DESKTOP_USER_AGENT =
//   'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const NON_BOT_DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4372.0 Safari/537.36'
const NON_BOT_HOSTS = ['bloomberg.com', 'forbes.com']
const NON_SCRIPT_HOSTS = ['medium.com', 'fastcompany.com', 'fortelabs.com']

const ALLOWED_CONTENT_TYPES = [
  'text/html',
  'application/octet-stream',
  'text/plain',
  'application/pdf',
]
const REQUEST_TIMEOUT = 30000

const userAgentForUrl = (url: string) => {
  try {
    const u = new URL(url)
    for (const host of NON_BOT_HOSTS) {
      if (u.hostname.endsWith(host)) {
        return NON_BOT_DESKTOP_USER_AGENT
      }
    }
  } catch (e) {
    console.log('error getting user agent for url', url, e)
  }
  return DESKTOP_USER_AGENT
}

const fetchContentWithScrapingBee = async (url: string) => {
  try {
    const response = await axios.get('https://app.scrapingbee.com/api/v1', {
      params: {
        api_key: process.env.SCRAPINGBEE_API_KEY,
        url: url,
        render_js: 'false',
        premium_proxy: 'true',
        country_code: 'us',
      },
      timeout: REQUEST_TIMEOUT,
    })

    const dom = parseHTML(response.data).document
    return { title: dom.title, domContent: dom.documentElement.outerHTML, url }
  } catch (e) {
    console.error('error fetching with scrapingbee', e)

    return { title: url, domContent: '', url }
  }
}

const enableJavascriptForUrl = (url: string) => {
  try {
    const u = new URL(url)
    for (const host of NON_SCRIPT_HOSTS) {
      if (u.hostname.endsWith(host)) {
        return false
      }
    }
  } catch (e) {
    console.log('error getting hostname for url', url, e)
  }
  return true
}

// launch Puppeteer
const getBrowserPromise = (async () => {
  console.log('starting puppeteer browser')
  return (await puppeteer.launch({
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
      '--disable-gpu',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--window-size=1920,1080',
      '--disable-extensions',
    ].filter((item) => !!item),
    defaultViewport: {
      deviceScaleFactor: 1,
      hasTouch: false,
      height: 1080,
      isLandscape: true,
      isMobile: false,
      width: 1920,
    },
    executablePath: process.env.CHROMIUM_PATH,
    headless: !!process.env.LAUNCH_HEADLESS,
    timeout: 120000, // 2 minutes
  })) as Browser
})()

export const fetchContent = async (
  url: string,
  locale?: string,
  timezone?: string
) => {
  const functionStartTime = Date.now()
  const logRecord = {
    url,
    functionStartTime,
    locale,
    timezone,
  }
  console.log(`content-fetch request`, logRecord)

  let context: BrowserContext | undefined,
    page: Page | undefined,
    title: string | undefined,
    content: string | undefined,
    contentType: string | undefined

  try {
    url = getUrl(url)
    if (!url) {
      throw new Error('Valid URL to parse not specified')
    }

    // pre handle url with custom handlers
    try {
      const browser = await getBrowserPromise
      const result = await preHandleContent(url, browser)
      if (result && result.url) {
        validateUrlString(url)
        url = result.url
      }
      if (result && result.title) {
        title = result.title
      }
      if (result && result.content) {
        content = result.content
      }
      if (result && result.contentType) {
        contentType = result.contentType
      }
    } catch (e) {
      console.info('error with handler: ', e)
    }

    if ((!content || !title) && contentType !== 'application/pdf') {
      const result = await retrievePage(
        url,
        logRecord,
        functionStartTime,
        locale,
        timezone
      )
      if (result && result.context) {
        context = result.context
      }
      if (result && result.page) {
        page = result.page
      }
      if (result && result.finalUrl) {
        url = result.finalUrl
      }
      if (result && result.contentType) {
        contentType = result.contentType
      }
    }

    if (contentType !== 'application/pdf') {
      if (page && (!content || !title)) {
        const result = await retrieveHtml(page, logRecord)
        if (result.isBlocked) {
          const sbResult = await fetchContentWithScrapingBee(url)
          title = sbResult.title
          content = sbResult.domContent
        } else {
          title = result.title
          content = result.domContent
        }
      } else {
        console.info('using prefetched content and title')
      }
    }
  } catch (e) {
    console.error(`Error while retrieving page ${url}`, e)

    // fallback to scrapingbee for non pdf content
    if (url && contentType !== 'application/pdf') {
      console.info('fallback to scrapingbee', url)

      const sbResult = await fetchContentWithScrapingBee(url)

      return {
        finalUrl: url,
        title: sbResult.title,
        content: sbResult.domContent,
        contentType,
      }
    }

    throw e
  } finally {
    // close browser context if it was opened
    if (context) {
      await context.close()
    }

    console.info(`content-fetch result`, logRecord)
  }

  return { finalUrl: url, title, content, contentType }
}

function validateUrlString(url: string) {
  const u = new URL(url)
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

function tryParseUrl(urlStr: string) {
  if (!urlStr) {
    return null
  }

  // a regular expression to match all URLs
  const regex = /(https?:\/\/[^\s]+)/g

  const matches = urlStr.match(regex)

  if (matches) {
    return matches[0] // only return first match
  } else {
    return null
  }
}

function getUrl(urlStr: string) {
  const url = tryParseUrl(urlStr)
  if (!url) {
    throw new Error('No URL specified')
  }

  validateUrlString(url)

  const parsed = Url.parse(url)
  return parsed.href
}

async function retrievePage(
  url: string,
  logRecord: Record<string, any>,
  functionStartTime: number,
  locale?: string,
  timezone?: string
) {
  validateUrlString(url)

  const browser = await getBrowserPromise
  logRecord.timing = {
    ...logRecord.timing,
    browserOpened: Date.now() - functionStartTime,
  }

  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()

  if (!enableJavascriptForUrl(url)) {
    await page.setJavaScriptEnabled(false)
  }
  await page.setUserAgent(userAgentForUrl(url))

  // set locale for the page
  if (locale) {
    await page.setExtraHTTPHeaders({ 'Accept-Language': locale })
  }

  // set timezone for the page
  if (timezone) {
    await page.emulateTimezone(timezone)
  }

  const client = await page.target().createCDPSession()

  const downloadPath = path.resolve('./download_dir/')
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath,
  })

  // intercept request when response headers was received
  await client.send('Network.setRequestInterception', {
    patterns: [
      {
        urlPattern: '*',
        resourceType: 'Document',
        interceptionStage: 'HeadersReceived',
      },
    ],
  })

  client.on(
    'Network.requestIntercepted',
    (e: Protocol.Network.RequestInterceptedEvent) => {
      ;(async () => {
        const headers = e.responseHeaders || {}

        const [contentType] = (
          headers['content-type'] ||
          headers['Content-Type'] ||
          ''
        )
          .toLowerCase()
          .split(';')
        const obj: Protocol.Network.ContinueInterceptedRequestRequest = {
          interceptionId: e.interceptionId,
        }

        if (
          e.responseStatusCode &&
          e.responseStatusCode >= 200 &&
          e.responseStatusCode < 300
        ) {
          // We only check content-type on success responses
          // as it doesn't matter what the content type is for things
          // like redirects
          if (contentType && !ALLOWED_CONTENT_TYPES.includes(contentType)) {
            obj['errorReason'] = 'BlockedByClient'
          }
        }

        try {
          await client.send('Network.continueInterceptedRequest', obj)
        } catch {
          // ignore
        }
      })()
    }
  )

  /*
   * Disallow MathJax from running in Puppeteer and modifying the document,
   * we shall instead run it in our frontend application to transform any
   * mathjax content when present.
   */
  await page.setRequestInterception(true)
  let requestCount = 0
  page.on('request', (request) => {
    ;(async () => {
      if (request.resourceType() === 'font') {
        // Disallow fonts from loading
        return request.abort()
      }
      if (requestCount++ > 100) {
        return request.abort()
      }
      if (
        request.resourceType() === 'script' &&
        request.url().toLowerCase().indexOf('mathjax') > -1
      ) {
        return request.abort()
      }

      await request.continue()
    })()
  })

  // Puppeteer fails during download of PDf files,
  // so record the failure and use those items
  let lastPdfUrl = undefined
  page.on('response', (response) => {
    if (response.headers()['content-type'] === 'application/pdf') {
      lastPdfUrl = response.url()
    }
  })

  try {
    const response = await page.goto(url, {
      timeout: 30 * 1000,
      waitUntil: ['networkidle2'],
    })
    if (!response) {
      throw new Error('No response from page')
    }

    const finalUrl = response.url()
    const contentType = response.headers()['content-type']

    logRecord.finalUrl = finalUrl
    logRecord.contentType = contentType

    return { context, page, response, finalUrl, contentType }
  } catch (error) {
    if (lastPdfUrl) {
      return {
        context,
        page,
        finalUrl: lastPdfUrl,
        contentType: 'application/pdf',
      }
    }
    await context.close()
    throw error
  }
}

async function retrieveHtml(page: Page, logRecord: Record<string, any>) {
  let domContent, title
  try {
    title = await page.title()
    logRecord.title = title

    const pageScrollingStart = Date.now()
    /* scroll with a 5 seconds timeout */
    await Promise.race([
      await page
        .evaluate(
          `(async () => {
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
              })()`
        )
        .catch((e) => {
          console.log('error scrolling page', e)
          logRecord.scrollError = true
        }),
      new Promise((r) => setTimeout(r, 5000)),
    ])

    logRecord.timing = {
      ...logRecord.timing,
      pageScrolled: Date.now() - pageScrollingStart,
    }

    const iframes: Record<string, any> = {}
    const urls: string[] = []
    const framesPromises = []
    const allowedUrls = /instagram\.com/gi

    for (const frame of page.mainFrame().childFrames()) {
      if (frame.url() && allowedUrls.test(frame.url())) {
        urls.push(frame.url())
        framesPromises.push(
          frame.evaluate((el) => el?.innerHTML, await frame.$('body'))
        )
      }
    }

    ;(await Promise.all(framesPromises)).forEach(
      (frame, index) => (iframes[urls[index]] = frame)
    )

    const domContentCapturingStart = Date.now()
    // get document body with all hidden elements removed
    domContent = await page.evaluate((iframes) => {
      const BI_SRC_REGEXP = /url\("(.+?)"\)/gi

      Array.from(document.body.getElementsByTagName('*')).forEach((el) => {
        const style = window.getComputedStyle(el)
        const src = el.getAttribute('src')

        try {
          // Removing blurred images since they are mostly the copies of lazy loaded ones
          if (
            el.tagName &&
            ['img', 'image'].includes(el.tagName.toLowerCase())
          ) {
            const filter = style.getPropertyValue('filter')
            if (filter && filter.startsWith('blur')) {
              el.parentNode && el.parentNode.removeChild(el)
            }
          }
        } catch (err) {
          // throw Error('error with element: ' + JSON.stringify(Array.from(document.body.getElementsByTagName('*'))))
        }

        // convert all nodes with background image to img nodes
        if (
          !['', 'none'].includes(style.getPropertyValue('background-image'))
        ) {
          const filter = style.getPropertyValue('filter')
          // avoiding image nodes with a blur effect creation
          if (filter && filter.startsWith('blur')) {
            el && el.parentNode && el.parentNode.removeChild(el)
          } else {
            const matchedSRC = BI_SRC_REGEXP.exec(
              style.getPropertyValue('background-image')
            )
            // Using "g" flag with a regex we have to manually break down lastIndex to zero after every usage
            // More details here: https://stackoverflow.com/questions/1520800/why-does-a-regexp-with-global-flag-give-wrong-results
            BI_SRC_REGEXP.lastIndex = 0

            if (matchedSRC && matchedSRC[1] && !src) {
              // Replacing element only of there are no content inside, b/c might remove important div with content.
              // Article example: http://www.josiahzayner.com/2017/01/genetic-designer-part-i.html
              // DIV with class "content-inner" has `url("https://resources.blogblog.com/blogblog/data/1kt/travel/bg_container.png")` background image.
              if (!el.textContent) {
                const img = document.createElement('img')
                img.src = matchedSRC[1]
                el && el.parentNode && el.parentNode.replaceChild(img, el)
              }
            }
          }
        }

        if (el.tagName === 'IFRAME') {
          if (src && iframes[src]) {
            const newNode = document.createElement('div')
            newNode.className = 'omnivore-instagram-embed'
            newNode.innerHTML = iframes[src]
            el && el.parentNode && el.parentNode.replaceChild(newNode, el)
          }
        }
      })

      if (
        document.querySelector('[data-translate="managed_checking_msg"]') ||
        document.getElementById('px-block-form-wrapper')
      ) {
        return 'IS_BLOCKED'
      }

      return document.documentElement.outerHTML
    }, iframes)
    logRecord.puppeteerSuccess = true
    logRecord.timing = {
      ...logRecord.timing,
      contenCaptured: Date.now() - domContentCapturingStart,
    }

    // [END puppeteer-block]
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.startsWith('net::ERR_BLOCKED_BY_CLIENT at ')) {
        logRecord.blockedByClient = true
      } else {
        logRecord.puppeteerSuccess = false
        logRecord.puppeteerError = {
          message: e.message,
          stack: e.stack,
        }
      }
    } else {
      logRecord.puppeteerSuccess = false
      logRecord.puppeteerError = e
    }
  }
  if (domContent === 'IS_BLOCKED') {
    return { isBlocked: true }
  }
  return { domContent, title }
}

// async function preview(req, res) {
//   const functionStartTime = Date.now();
//   // Grabbing execution and trace ids to attach logs to the appropriate function call
//   const execution_id = req.get('function-execution-id');
//   const traceId = (req.get('x-cloud-trace-context') || '').split('/')[0];
//   const console = buildconsole('cloudfunctions.googleapis.com%2Fcloud-functions', {
//     trace: `projects/${process.env.GCLOUD_PROJECT}/traces/${traceId}`,
//     labels: {
//       execution_id: execution_id,
//     },
//   });

//   if (!process.env.PREVIEW_IMAGE_BUCKET) {
//     console.error(`PREVIEW_IMAGE_BUCKET not set`)
//     return res.sendStatus(500);
//   }

//   const urlStr = (req.query ? req.query.url : undefined) || (req.body ? req.body.url : undefined);
//   const url = getUrl(urlStr);
//   console.log('preview request url', url);

//   const logRecord = {
//     url,
//     query: req.query,
//     origin: req.get('Origin'),
//     labels: {
//       source: 'publicImagePreview',
//     },
//   };

//   console.info(`Public preview image generation request`, logRecord);

//   if (!url) {
//     logRecord.urlIsInvalid = true;
//     console.error(`Valid URL to parse is not specified`, logRecord);
//     return res.sendStatus(400);
//   }
//   const { origin } = new URL(url);
//   if (!ALLOWED_ORIGINS.some(o => o === origin)) {
//     logRecord.forbiddenOrigin = true;
//     console.error(`This origin is not allowed: ${origin}`, logRecord);
//     return res.sendStatus(400);
//   }

//   const browser = await getBrowserPromise;
//   logRecord.timing = { ...logRecord.timing, browserOpened: Date.now() - functionStartTime };

//   const page = await browser.newPage();
//   const pageLoadingStart = Date.now();
//   const modifiedUrl = new URL(url);
//   modifiedUrl.searchParams.append('fontSize', '24');
//   modifiedUrl.searchParams.append('adjustAspectRatio', '1.91');
//   try {
//     await page.goto(modifiedUrl.toString());
//     logRecord.timing = { ...logRecord.timing, pageLoaded: Date.now() - pageLoadingStart };
//   } catch (error) {
//     console.log('error going to page: ', modifiedUrl)
//     console.log(error)
//     throw error
//   }

//   // We lookup the destination path from our own page content and avoid trusting any passed query params
//   // selector - CSS selector of the element to get screenshot of
//   const selector = decodeURIComponent(
//     await page.$eval(
//       "head > meta[name='omnivore:preview_image_selector']",
//       element => element.content,
//     ),
//   );
//   if (!selector) {
//     logRecord.selectorIsInvalid = true;
//     console.error(`Valid element selector is not specified`, logRecord);
//     await page.close();
//     return res.sendStatus(400);
//   }
//   logRecord.selector = selector;

//   // destination - destination pathname for the image to save with
//   const destination = decodeURIComponent(
//     await page.$eval(
//       "head > meta[name='omnivore:preview_image_destination']",
//       element => element.content,
//     ),
//   );
//   if (!destination) {
//     logRecord.destinationIsInvalid = true;
//     console.error(`Valid file destination is not specified`, logRecord);
//     await page.close();
//     return res.sendStatus(400);
//   }
//   logRecord.destination = destination;

//   const screenshotTakingStart = Date.now();
//   try {
//     await page.waitForSelector(selector, { timeout: 3000 }); // wait for the selector to load
//   } catch (error) {
//     logRecord.elementNotFound = true;
//     console.error(`Element is not presented on the page`, logRecord);
//     await page.close();
//     return res.sendStatus(400);
//   }
//   const element = await page.$(selector);
//   await element.screenshot({ path: filePath }); // take screenshot of the element in puppeteer
//   logRecord.timing = { ...logRecord.timing, screenshotTaken: Date.now() - screenshotTakingStart };

//   await page.close();

//   try {
//     const [file] = await previewBucket.upload(filePath, {
//       destination,
//       metadata: logRecord,
//     });
//     logRecord.file = file.metadata;
//   } catch (e) {
//     console.log('error uploading to bucket, this is non-fatal', e)
//   }

//   console.info(`preview-image`, logRecord);
//   return res.redirect(`${process.env.PREVIEW_IMAGE_CDN_ORIGIN}/${destination}`);
// }
