/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Readability } from '@omnivore/readability'
import createDOMPurify, { SanitizeElementHookEvent } from 'dompurify'
import { PageType, PreparedDocumentInput } from '../generated/graphql'
import { buildLogger, LogRecord } from './logger'
import { createImageProxyUrl } from './imageproxy'
import axios from 'axios'
import * as hljs from 'highlightjs'
import { decode } from 'html-entities'
import { parseHTML } from 'linkedom'
import { getRepository } from '../entity/utils'
import { User } from '../entity/user'
import { ILike } from 'typeorm'
import { v4 as uuid } from 'uuid'
import addressparser from 'addressparser'

const logger = buildLogger('utils.parse')

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
const ARTICLE_PREFIX = 'omnivore:'

export const FAKE_URL_PREFIX = 'https://omnivore.app/no_url?q='

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
  pageType: PageType
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

const parseOriginalContent = (document: Document): PageType => {
  try {
    const e = document.querySelector("head meta[property='og:type']")
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
    logger.error('Error extracting og:type from content', error)
  }

  return PageType.Unknown
}

const getPurifiedContent = (html: string): Document => {
  const newWindow = parseHTML('')
  const DOMPurify = createDOMPurify(newWindow)
  DOMPurify.addHook('uponSanitizeElement', domPurifySanitizeHook)
  const clean = DOMPurify.sanitize(html, DOM_PURIFY_CONFIG)
  return parseHTML(clean).document
}

const getReadabilityResult = async (
  url: string,
  html: string,
  document: Document,
  isNewsletter?: boolean
): Promise<Readability.ParseResult | null> => {
  // First attempt to read the article as is.
  // if that fails attempt to purify then read
  const sources = [
    () => {
      return document
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
      const article = await new Readability(document, {
        debug: DEBUG_MODE,
        createImageProxyUrl,
        keepTables: isNewsletter,
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

export const parsePreparedContent = async (
  url: string,
  preparedDocument: PreparedDocumentInput,
  isNewsletter?: boolean,
  allowRetry = true
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
      pageType: PageType.Unknown,
    }
  }

  const dom = parseHTML(document).document

  try {
    article = await getReadabilityResult(url, document, dom, isNewsletter)
    if (!article?.textContent && allowRetry) {
      const newDocument = {
        ...preparedDocument,
        document: '<html>' + preparedDocument.document + '</html>',
      }
      return parsePreparedContent(url, newDocument, isNewsletter, false)
    }

    // Format code blocks
    // TODO: we probably want to move this type of thing
    // to the handlers, and have some concept of postHandle
    if (article?.dom) {
      const codeBlocks = article.dom.querySelectorAll('code')
      if (codeBlocks.length > 0) {
        codeBlocks.forEach((e) => {
          if (e.textContent) {
            const att = hljs.highlightAuto(e.textContent)
            const code = dom.createElement('code')
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
        article.content = article.dom.outerHTML
      }

      const ANCHOR_ELEMENTS_BLOCKED_ATTRIBUTES = [
        'omnivore-highlight-id',
        'data-twitter-tweet-id',
        'data-instagram-id',
      ]

      // Get the top level element?
      const pageNode = article.dom.firstElementChild as HTMLElement
      const nodesToVisitStack: [HTMLElement] = [pageNode]
      const visitedNodeList = []

      while (nodesToVisitStack.length > 0) {
        const currentNode = nodesToVisitStack.pop()
        if (
          currentNode?.nodeType !== 1 ||
          // Avoiding dynamic elements from being counted as anchor-allowed elements
          ANCHOR_ELEMENTS_BLOCKED_ATTRIBUTES.some((attrib) =>
            currentNode.hasAttribute(attrib)
          )
        ) {
          continue
        }
        visitedNodeList.push(currentNode)
        ;[].slice
          .call(currentNode.childNodes)
          .reverse()
          .forEach(function (node) {
            nodesToVisitStack.push(node)
          })
      }

      visitedNodeList.shift()
      visitedNodeList.forEach((node, index) => {
        // start from index 1, index 0 reserved for anchor unknown.
        node.setAttribute('data-omnivore-anchor-idx', (index + 1).toString())
      })

      article.content = article.dom.outerHTML
    }

    const newWindow = parseHTML('')
    const DOMPurify = createDOMPurify(newWindow)
    DOMPurify.addHook('uponSanitizeElement', domPurifySanitizeHook)
    const clean = DOMPurify.sanitize(article?.content || '', DOM_PURIFY_CONFIG)

    const jsonLdLinkMetadata = (async () => {
      return getJSONLdLinkMetadata(dom)
    })()

    Object.assign(article || {}, {
      content: clean,
      title: article?.title || (await jsonLdLinkMetadata).title,
      previewImage:
        article?.previewImage || (await jsonLdLinkMetadata).previewImage,
      siteName: article?.siteName || (await jsonLdLinkMetadata).siteName,
      siteIcon: article?.siteIcon,
      byline: article?.byline || (await jsonLdLinkMetadata).byline,
      language: article?.language,
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
    pageType: parseOriginalContent(dom),
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
    const document = parseHTML(html).document

    // get open graph metadata
    const description =
      document
        .querySelector("head meta[property='og:description']")
        ?.getAttribute('content') || ''

    const previewImage =
      document
        .querySelector("head meta[property='og:image']")
        ?.getAttribute('content') || ''

    const title =
      document
        .querySelector("head meta[property='og:title']")
        ?.getAttribute('content') || undefined

    const author =
      document
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

export const isProbablyArticle = async (
  email: string,
  subject: string
): Promise<boolean> => {
  const user = await getRepository(User).findOneBy({
    email: ILike(email),
  })
  return !!user || subject.includes(ARTICLE_PREFIX)
}

export const generateUniqueUrl = () => FAKE_URL_PREFIX + uuid()

export const getTitleFromEmailSubject = (subject: string) => {
  const title = subject.replace(ARTICLE_PREFIX, '')
  return title.trim()
}

export const parseEmailAddress = (from: string): addressparser.EmailAddress => {
  // get author name from email
  // e.g. 'Jackson Harper from Omnivore App <jacksonh@substack.com>'
  // or 'Mike Allen <mike@axios.com>'
  const parsed = addressparser(from)
  if (parsed.length > 0) {
    return parsed[0]
  }
  return { name: '', address: from }
}

export const fetchFavicon = async (
  url: string
): Promise<string | undefined> => {
  try {
    // get the correct url if it's a redirect
    const response = await axios.head(url, { timeout: 5000 })
    const realUrl = response.request.res.responseUrl
    const domain = new URL(realUrl).hostname
    return `https://api.faviconkit.com/${domain}/32`
  } catch (e) {
    console.log('Error fetching favicon', e)
    return undefined
  }
}
