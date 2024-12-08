/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { preHandleContent } from '@omnivore/content-handler'
import path from 'path'
import { BrowserContext, Page, Protocol } from 'puppeteer-core'
import { getBrowser } from './browser'

const NON_SCRIPT_HOSTS = ['medium.com', 'fastcompany.com', 'fortelabs.com']

const ALLOWED_CONTENT_TYPES = [
  'text/html',
  'application/octet-stream',
  'text/plain',
  'application/pdf',
]

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

  let title: string | undefined,
    content: string | undefined,
    contentType: string | undefined,
    context: BrowserContext | undefined

  try {
    url = getUrl(url)

    // pre handle url with custom handlers
    try {
      const result = await preHandleContent(url)
      if (result?.url) {
        url = getUrl(result.url)
      }
      title = result?.title
      content = result?.content
      contentType = result?.contentType
    } catch (e) {
      console.error('error with handler: ', e)
    }

    if (contentType !== 'application/pdf' && (!content || !title)) {
      const result = await retrievePage(
        url,
        logRecord,
        functionStartTime,
        locale,
        timezone
      )
      context = result.context
      url = result.finalUrl
      contentType = result.contentType

      const page = result.page
      if (page) {
        const result = await retrieveHtml(page, logRecord)
        title = result.title
        content = result.domContent
      }
    }
  } catch (e) {
    console.error(`Error while retrieving page ${url}`, e)

    throw e
  } finally {
    // close browser context if it was created
    if (context) {
      console.info('closing context...', url)
      await context.close()
      console.info('context closed', url)
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

  const parsed = new URL(url)
  return parsed.href
}

const waitForDOMToSettle = (page: Page, timeoutMs = 5000, debounceMs = 1000) =>
  page.evaluate(
    (timeoutMs, debounceMs) => {
      const debounce = (func: (...args: unknown[]) => void, ms = 1000) => {
        let timeout: NodeJS.Timeout
        console.log(`Debouncing in  ${ms}`)
        return (...args: unknown[]) => {
          console.log('in debounce, clearing timeout again')
          clearTimeout(timeout)
          timeout = setTimeout(() => {
            func.apply(this, args)
          }, ms)
        }
      }
      return new Promise<void>((resolve) => {
        const mainTimeout = setTimeout(() => {
          observer.disconnect()
          console.log(
            'Timed out whilst waiting for DOM to settle. Using what we have.'
          )
          resolve()
        }, timeoutMs)

        const debouncedResolve = debounce(() => {
          observer.disconnect()
          clearTimeout(mainTimeout)
          resolve()
        }, debounceMs)

        const observer = new MutationObserver(() => {
          debouncedResolve()
        })

        const config = {
          attributes: true,
          childList: true,
          subtree: true,
        }

        observer.observe(document.body, config)
      })
    },
    timeoutMs,
    debounceMs
  )

async function retrievePage(
  url: string,
  logRecord: Record<string, any>,
  functionStartTime: number,
  locale?: string,
  timezone?: string
) {
  validateUrlString(url)

  logRecord.timing = {
    ...logRecord.timing,
    browserOpened: Date.now() - functionStartTime,
  }

  const browser = await getBrowser()
  const context = await browser.createBrowserContext()

  // Puppeteer fails during download of PDf files,
  // so record the failure and use those items
  let lastPdfUrl
  try {
    const page = await context.newPage()

    if (!enableJavascriptForUrl(url)) {
      await page.setJavaScriptEnabled(false)
    }

    // set locale for the page
    if (locale) {
      await page.setExtraHTTPHeaders({ 'Accept-Language': locale })
    }

    // set timezone for the page
    if (process.env['USE_FIREFOX'] !== 'true') {
      if (timezone) {
        await page.emulateTimezone(timezone)
      }

      const client = await page.createCDPSession()

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
    }

    /*
     * Disallow MathJax from running in Puppeteer and modifying the document,
     * we shall instead run it in our frontend application to transform any
     * mathjax content when present.
     */

    let requestCount = 0
    const failedRequests = new Set()
    page.removeAllListeners('request')
    page.on('request', (request) => {
      ;(async () => {
        if (request.isInterceptResolutionHandled()) return
        // since .requestType() is not FF compatible, look for font files.
        if (request.url().toLowerCase().includes('.woff2')) {
          // Disallow fonts from loading
          return request.abort()
        }

        if (requestCount++ > 100) {
          return request.abort()
        }

        if (failedRequests.has(request.url())) {
          return request.abort()
        }

        if (
          request.url().toLowerCase().indexOf('mathjax') > -1
        ) {
          return request.abort()
        }

        await request.continue()
      })()
    })
    await page.setRequestInterception(true)


    page.on('response', (response) => {
      if (!response.ok()) {
        console.log('Failed request', response.url())
        failedRequests.add(response.url())
      }

      if (response.headers()['content-type'] === 'application/pdf') {
        lastPdfUrl = response.url()
      }
    })

    console.log('Trying to load page, for 30 seconds')

    const response = await page.goto(url, {
      timeout: 30 * 1000,
      waitUntil: ['load'],
    })

    console.log('Waited for content to load, waiting for DOM to settle.')
    await waitForDOMToSettle(page)
    // Just wait for a few seconds to allow the dom to resolve.
    // await new Promise((r) => setTimeout(r, 2500))

    if (!response) {
      throw new Error('No response from page')
    }

    const finalUrl = response.url()
    const contentType = response.headers()['content-type']

    logRecord.finalUrl = finalUrl
    logRecord.contentType = contentType

    return { page, finalUrl, contentType, context }
  } catch (error) {
    if (lastPdfUrl) {
      return {
        context,
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

    await page.waitForSelector('body')

    const pageScrollingStart = Date.now()
    /* scroll with a 5 seconds timeout */
    try {
      await Promise.race([
        page.evaluate(
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
        ),
        new Promise((r) => setTimeout(r, 5000)),
      ])
    } catch (error) {
      console.error('Error scrolling page', error)
      logRecord.scrollError = true
    }

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

    throw e
  }

  if (domContent === 'IS_BLOCKED') {
    logRecord.blockedByClient = true

    throw new Error('Page is blocked')
  }

  return { domContent, title }
}
