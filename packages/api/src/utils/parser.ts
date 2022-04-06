/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Readability } from '@omnivore/readability'
import { DOMWindow, JSDOM, VirtualConsole } from 'jsdom'
import createDOMPurify, { SanitizeElementHookEvent } from 'dompurify'
import { PageType, PreparedDocumentInput } from '../generated/graphql'
import { buildLogger, LogRecord } from './logger'
import { createImageProxyUrl } from './imageproxy'
import axios from 'axios'
import { WikipediaHandler } from './wikipedia-handler'
import { SubstackHandler } from './substack-handler'
import { AxiosHandler } from './axios-handler'
import { BloombergHandler } from './bloomberg-handler'
import { GolangHandler } from './golang-handler'
import * as hljs from 'highlightjs'
import { decode } from 'html-entities'

const logger = buildLogger('utils.parse')

const virtualConsole = new VirtualConsole()

export const ALLOWED_CONTENT_TYPES = [
  'text/html',
  'application/octet-stream',
  'text/plain',
]

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

interface ContentHandler {
  shouldPrehandle: (url: URL, dom: DOMWindow) => boolean
  prehandle: (url: URL, document: DOMWindow) => Promise<DOMWindow>
}

const HANDLERS = [
  new WikipediaHandler(),
  new SubstackHandler(),
  new AxiosHandler(),
  new BloombergHandler(),
  new GolangHandler(),
]

/** Hook that prevents DOMPurify from removing youtube iframes */
const domPurifySanitizeHook = (
  node: Element,
  data: SanitizeElementHookEvent
): void => {
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

export type ParsedContentPuppeteer = {
  domContent: string
  parsedContent: Readability.ParseResult | null
  canonicalUrl?: string | null
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type ArticleParseLogRecord = LogRecord & {
  url: string
  userAgent?: string
  pageInfo?: { [key: string]: any }
  blockedByClient?: boolean
  parsedOrigin?: boolean
  origin?: string
  puppeteerSuccess?: boolean
  puppeteerError?: { [key: string]: any }
  parseSuccess?: boolean
  parseError?: { [key: string]: any }
  scrollError?: boolean
  isAllowedContentType?: boolean
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const DEBUG_MODE = process.env.DEBUG === 'true' || false

export const parseOriginalContent = (url: string, html: string): PageType => {
  try {
    const { window } = new JSDOM(html, { url })
    const e = window.document.querySelector("head meta[property='og:type']")
    const content = e?.getAttribute('content')
    if (!content) {
      return PageType.Unknown
    }

    switch (content.toLowerCase()) {
      case 'article':
        return PageType.Article
      case 'book':
        return PageType.Book
      case 'profile':
        return PageType.Profile
      case 'website':
        return PageType.Website
    }
  } catch (error) {
    logger.error('Error extracting og:type from content for url', url, error)
  }

  return PageType.Unknown
}

const getPurifiedContent = (html: string): Document => {
  const newWindow = new JSDOM('').window
  const DOMPurify = createDOMPurify(newWindow as unknown as Window)
  DOMPurify.addHook('uponSanitizeElement', domPurifySanitizeHook)
  const clean = DOMPurify.sanitize(html, DOM_PURIFY_CONFIG)
  return new JSDOM(clean).window.document
}

const getReadabilityResult = (
  url: string,
  html: string,
  window: DOMWindow,
  isNewsletter?: boolean
): Readability.ParseResult | null => {
  virtualConsole.removeAllListeners('jsdomError')
  virtualConsole.on('jsdomError', ({ message, stack: _stack, ...details }) => {
    logger.warning(`JSDOM error occurred`, {
      errorMsg: message,
      ...details,
    })
  })

  // First attempt to read the article as is.
  // if that fails attempt to purify then read
  const sources = [
    () => {
      return window.document
    },
    () => {
      return getPurifiedContent(html)
    },
  ]

  for (const source of sources) {
    const document = source()
    if (!document) {
      continue
    }

    try {
      const article = new Readability(document, {
        debug: DEBUG_MODE,
        createImageProxyUrl,
        keepTables: isNewsletter,
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

const applyHandlers = async (url: string, window: DOMWindow): Promise<void> => {
  try {
    const u = new URL(url)
    const handler = HANDLERS.find((h) => {
      try {
        return h.shouldPrehandle(u, window)
      } catch (e) {
        console.log('error with handler: ', h.name, e)
      }
      return false
    })
    if (handler) {
      try {
        console.log('pre-handling url or content with handler: ', handler.name)
        await handler.prehandle(u, window)
      } catch (e) {
        console.log('error with handler: ', handler, e)
      }
    }
  } catch (error) {
    logger.error('Error prehandling url', url, error)
  }
}

export const parsePreparedContent = async (
  url: string,
  preparedDocument: PreparedDocumentInput,
  isNewsletter?: boolean
): Promise<ParsedContentPuppeteer> => {
  const logRecord: ArticleParseLogRecord = {
    url: url,
    labels: { source: 'parsePreparedContent' },
  }

  let article = null
  const { document, pageInfo } = preparedDocument

  // Checking for content type acceptance or if there are no contentType
  // at all (backward extension versions compatibility)
  if (
    pageInfo.contentType &&
    !ALLOWED_CONTENT_TYPES.includes(pageInfo.contentType)
  ) {
    console.log('Not allowed content type', pageInfo.contentType)
    return {
      canonicalUrl: url,
      parsedContent: null,
      domContent: preparedDocument.document,
    }
  }

  virtualConsole.removeAllListeners('jsdomError')
  virtualConsole.on('jsdomError', ({ message, stack: _stack, ...details }) => {
    logger.warning(`JSDOM error occurred`, {
      ...logRecord,
      errorMsg: message,
      ...details,
    })
  })
  const { window } = new JSDOM(document, { url, virtualConsole })

  await applyHandlers(url, window)

  try {
    article = getReadabilityResult(url, document, window, isNewsletter)

    // Format code blocks
    // TODO: we probably want to move this type of thing
    // to the handlers, and have some concept of postHandle
    if (article?.content) {
      const cWindow = new JSDOM(article?.content).window
      cWindow.document.querySelectorAll('code').forEach((e) => {
        console.log(e.textContent)
        if (e.textContent) {
          const att = hljs.highlightAuto(e.textContent)
          const code = window.document.createElement('code')
          const langClass =
            `hljs language-${att.language}` +
            (att.second_best?.language
              ? ` language-${att.second_best?.language}`
              : '')
          code.setAttribute('class', langClass)
          code.innerHTML = att.value
          e.replaceWith(code)
        }
      })
      article.content = cWindow.document.body.outerHTML
    }

    const newWindow = new JSDOM('').window
    const DOMPurify = createDOMPurify(newWindow as unknown as Window)
    DOMPurify.addHook('uponSanitizeElement', domPurifySanitizeHook)
    const clean = DOMPurify.sanitize(article?.content || '', DOM_PURIFY_CONFIG)

    const jsonLdLinkMetadata = await getJSONLdLinkMetadata(window.document)
    logRecord.JSONLdParsed = jsonLdLinkMetadata

    Object.assign(article, {
      content: clean,
      title: article?.title || jsonLdLinkMetadata.title,
      previewImage: article?.previewImage || jsonLdLinkMetadata.previewImage,
      siteName: article?.siteName || jsonLdLinkMetadata.siteName,
      siteIcon: article?.siteIcon,
      byline: article?.byline || jsonLdLinkMetadata.byline,
    })
    logRecord.parseSuccess = true
  } catch (error) {
    console.log('Error parsing content', error)
    Object.assign(logRecord, {
      parseSuccess: false,
      parseError: error,
    })
  }

  const { title, canonicalUrl } = pageInfo

  Object.assign(article || {}, {
    title: article?.title || title,
  })

  logger.info('parse-article completed')

  return {
    domContent: preparedDocument.document,
    parsedContent: article,
    canonicalUrl,
  }
}

/**
 * Fetches the JSONLD link if found and parses an article metadata if presented
 *
 * Example article: https://thoughtsofstone.com/the-great-feminization/
 *
 * JSONLD Link example: https://thoughtsofstone.com/wp-json/oembed/1.0/embed?url=https%3A%2F%2Fthoughtsofstone.com%2Fthe-great-feminization%2F
 * @param document - JSDOM Document object of the content to parse link from
 * @returns Parsed article partial result from the JSONLD link if found (possibly not)
 */
const getJSONLdLinkMetadata = async (
  document: Document
): Promise<Partial<Readability.ParseResult>> => {
  const result: Partial<Readability.ParseResult> = {}
  try {
    const jsonLdLink = document.querySelector<HTMLLinkElement>(
      "link[type='application/json+oembed']"
    )
    if (!jsonLdLink || !jsonLdLink.href) return result

    const jsonLd =
      (await axios.get(jsonLdLink.href, { timeout: 5000 })).data || {}

    result.byline = decode(jsonLd['author_name'])
    result.previewImage = decode(jsonLd['thumbnail_url'])
    result.siteName = decode(jsonLd['provider_name'])
    result.title = decode(jsonLd['title'])

    return result
  } catch (error) {
    logger.warning(`Unable to get JSONLD link of the article`, error)
    return result
  }
}

type Metadata = {
  title?: string
  author?: string
  description: string
  previewImage: string
}

export const parsePageMetadata = (html: string): Metadata | undefined => {
  try {
    const window = new JSDOM(html).window

    // get open graph metadata
    const description =
      window.document
        .querySelector("head meta[property='og:description']")
        ?.getAttribute('content') || ''

    const previewImage =
      window.document
        .querySelector("head meta[property='og:image']")
        ?.getAttribute('content') || ''

    const title =
      window.document
        .querySelector("head meta[property='og:title']")
        ?.getAttribute('content') || undefined

    const author =
      window.document
        .querySelector("head meta[name='author']")
        ?.getAttribute('content') || undefined

    // TODO: we should be able to apply the JSONLD metadata
    // here too

    return { title, author, description, previewImage }
  } catch (e) {
    console.log('failed to parse page:', html, e)
    return undefined
  }
}

export const parseUrlMetadata = async (
  url: string
): Promise<Metadata | undefined> => {
  try {
    const res = await axios.get(url)
    return parsePageMetadata(res.data)
  } catch (e) {
    console.log('failed to get:', url, e)
    return undefined
  }
}

// Attempt to determine if an HTML blob is a newsletter
// based on it's contents.
// TODO: when we consolidate the handlers we could include this
// as a utility method on each one.
export const isProbablyNewsletter = (html: string): boolean => {
  const dom = new JSDOM(html).window
  const domCopy = new JSDOM(dom.document.documentElement.outerHTML)
  const article = new Readability(domCopy.window.document, {
    debug: false,
    keepTables: true,
  }).parse()

  if (!article || !article.content) {
    return false
  }

  // substack newsletter emails have tables with a *post-meta class
  if (dom.document.querySelector('table[class$="post-meta"]')) {
    return true
  }

  // If the article has a header link, and substack icons its probably a newsletter
  const href = findNewsletterHeaderHref(dom.window)
  const heartIcon = dom.document.querySelector(
    'table tbody td span a img[src*="HeartIcon"]'
  )
  const recommendIcon = dom.document.querySelector(
    'table tbody td span a img[src*="RecommendIconRounded"]'
  )
  if (href && (heartIcon || recommendIcon)) {
    return true
  }

  // Check if this is a beehiiv.net newsletter
  if (dom.document.querySelectorAll('img[src*="beehiiv.net"]').length > 0) {
    const beehiivUrl = beehiivNewsletterHref(dom.window)
    if (beehiivUrl) {
      return true
    }
  }

  return false
}

const beehiivNewsletterHref = (dom: DOMWindow): string | undefined => {
  const readOnline = dom.document.querySelectorAll(
    'table tr td div a[class*="link"]'
  )
  let res: string | undefined = undefined
  readOnline.forEach((e) => {
    if (e.textContent === 'Read Online') {
      res = e.getAttribute('href') || undefined
    }
  })
  return res
}

const findNewsletterHeaderHref = (dom: DOMWindow): string | undefined => {
  // Substack header links
  const postLink = dom.document.querySelector('h1 a ')
  if (postLink) {
    return postLink.getAttribute('href') || undefined
  }

  // Check if this is a beehiiv.net newsletter
  const beehiiv = beehiivNewsletterHref(dom.window)
  if (beehiiv) {
    return beehiiv
  }

  return undefined
}

// Given an HTML blob tries to find a URL to use for
// a canonical URL.
export const findNewsletterUrl = async (
  html: string
): Promise<string | undefined> => {
  const dom = new JSDOM(html).window

  // Check if this is a substack newsletter
  const href = findNewsletterHeaderHref(dom.window)
  if (href) {
    // Try to make a HEAD request so we get the redirected URL, since these
    // will usually be behind tracking url redirects
    return axios({
      method: 'HEAD',
      url: href,
    })
      .then((res) => res.request.res.responseUrl as string | undefined)
      .catch((e) => href)
  }

  return undefined
}
