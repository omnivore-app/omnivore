/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-base-to-string */

import { preParseContent } from '@omnivore/content-handler'
import { Readability } from '@omnivore/readability'
import addressparser from 'addressparser'
import axios from 'axios'
import createDOMPurify, { SanitizeElementHookEvent } from 'dompurify'
import * as hljs from 'highlightjs'
import { decode } from 'html-entities'
import * as jwt from 'jsonwebtoken'
import { parseHTML } from 'linkedom'
import { NodeHtmlMarkdown, TranslatorConfigObject } from 'node-html-markdown'
import { ElementNode } from 'node-html-markdown/dist/nodes'
import Parser from 'rss-parser'
import { parser } from 'sax'
import showdown from 'showdown'
import { ILike } from 'typeorm'
import { promisify } from 'util'
import { v4 as uuid } from 'uuid'
import { Highlight, HighlightType } from '../entity/highlight'
import { StatusType } from '../entity/user'
import { env } from '../env'
import { PageType, PreparedDocumentInput } from '../generated/graphql'
import { userRepository } from '../repository/user'
import { ArticleFormat } from '../resolvers/article'
import { generateFingerprint } from './helpers'
import {
  EmbeddedHighlightData,
  findEmbeddedHighlight,
  getArticleTextNodes,
  highlightIdAttribute,
  makeHighlightNodeAttributes,
} from './highlightGenerator'
import { createImageProxyUrl } from './imageproxy'
import { logger, LogRecord } from './logger'

interface Feed {
  title: string
  url: string
  type: string
  thumbnail?: string
  description?: string
}

const signToken = promisify(jwt.sign)

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0',
    Accept: 'text/html',
  },
  responseType: 'text',
})

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
export const rssParserConfig = () => {
  const fingerprint = generateFingerprint()

  return {
    headers: {
      'user-agent': fingerprint.headers['user-agent'],
      accept:
        'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4, text/html;q=0.2',
    },
    timeout: 20000, // 20 seconds
  }
}

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
  highlightData?: EmbeddedHighlightData
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
      case 'tweet':
        return PageType.Tweet
      case 'image':
        return PageType.Image
      default:
        if (content.toLowerCase().startsWith('video')) {
          return PageType.Video
        }
        return PageType.Unknown
    }
  } catch (error) {
    logger.error('Error extracting og:type from content', error)
    return PageType.Unknown
  }
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
  document?: Document,
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
        ignoreLinkDensity: isNewsletter,
        url,
      }).parse()

      if (article) {
        return article
      }
    } catch (error) {
      logger.info('parsing error for url', { url, error })
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

  const { document: domContent, pageInfo } = preparedDocument
  if (!domContent) {
    logger.info('No document')
    return {
      canonicalUrl: url,
      parsedContent: null,
      domContent: '',
      pageType: PageType.Unknown,
    }
  }

  // Checking for content type acceptance or if there are no contentType
  // at all (backward extension versions compatibility)
  if (
    pageInfo.contentType &&
    !ALLOWED_CONTENT_TYPES.includes(pageInfo.contentType)
  ) {
    logger.info(`Not allowed content type: ${pageInfo.contentType}`)
    return {
      canonicalUrl: url,
      parsedContent: null,
      domContent,
      pageType: PageType.Unknown,
    }
  }

  const { title: pageInfoTitle, canonicalUrl } = pageInfo

  let parsedContent: Readability.ParseResult | null = null
  let pageType = PageType.Unknown
  let highlightData = undefined

  try {
    const document = parseHTML(domContent).document
    pageType = parseOriginalContent(document)

    // Run readability
    await preParseContent(url, document)

    parsedContent = await getReadabilityResult(
      url,
      domContent,
      document,
      isNewsletter
    )

    if (!parsedContent || !parsedContent.content) {
      logger.info('No parsed content')

      if (allowRetry) {
        logger.info('Retrying with content wrapped in html body')

        const newDocument = {
          ...preparedDocument,
          document: '<html><body>' + domContent + '</body></html>', // wrap in body
        }
        return parsePreparedContent(url, newDocument, isNewsletter, false)
      }

      return {
        canonicalUrl,
        parsedContent,
        domContent,
        pageType,
      }
    }

    // use title if not found after running readability
    if (!parsedContent.title && pageInfoTitle) {
      parsedContent.title = pageInfoTitle
    }

    const newDocumentElement = parsedContent.documentElement
    // Format code blocks
    // TODO: we probably want to move this type of thing
    // to the handlers, and have some concept of postHandle
    const codeBlocks = newDocumentElement.querySelectorAll(
      'pre[class^="prism-"], pre[class^="language-"], code'
    )
    codeBlocks.forEach((e) => {
      if (!e.textContent) {
        return e.parentNode?.removeChild(e)
      }

      // replace <br> or <p> or </p> with \n
      e.innerHTML = e.innerHTML.replace(/<(br|p|\/p)>/g, '\n')

      const att = hljs.highlightAuto(e.textContent)
      const code = document.createElement('code')
      const langClass =
        `hljs language-${att.language}` +
        (att.second_best?.language
          ? ` language-${att.second_best?.language}`
          : '')
      code.setAttribute('class', langClass)
      code.innerHTML = att.value
      e.replaceWith(code)
    })

    highlightData = findEmbeddedHighlight(newDocumentElement)

    const ANCHOR_ELEMENTS_BLOCKED_ATTRIBUTES = [
      'omnivore-highlight-id',
      'data-twitter-tweet-id',
      'data-instagram-id',
    ]

    // Get the top level element?
    // const pageNode = newDocumentElement.firstElementChild as HTMLElement
    const nodesToVisitStack: [HTMLElement] = [newDocumentElement]
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

    const newHtml = newDocumentElement.outerHTML
    const newWindow = parseHTML('')
    const DOMPurify = createDOMPurify(newWindow)
    DOMPurify.addHook('uponSanitizeElement', domPurifySanitizeHook)
    const cleanHtml = DOMPurify.sanitize(newHtml, DOM_PURIFY_CONFIG)
    parsedContent.content = cleanHtml

    logRecord.parseSuccess = true
  } catch (error) {
    logger.error('Error parsing content', error)

    Object.assign(logRecord, {
      parseSuccess: false,
      parseError: error,
    })
  }

  logger.info('parse-article completed', logRecord)

  return {
    canonicalUrl,
    parsedContent,
    domContent,
    pageType,
    highlightData,
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
    logger.error('Unable to get JSONLD link of the article')
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
    logger.info('failed to parse page:', e)
    return undefined
  }
}

export const parseUrlMetadata = async (
  url: string
): Promise<Metadata | undefined> => {
  try {
    const res = await axios.get(url)
    return parsePageMetadata(res.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(error.response)
    } else {
      logger.error(error)
    }
    return undefined
  }
}

export const isProbablyArticle = async (
  email: string,
  subject: string
): Promise<boolean> => {
  const user = await userRepository.findOneBy({
    email: ILike(email),
    status: StatusType.Active,
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
  // don't fetch favicon for fake urls
  if (url.startsWith(FAKE_URL_PREFIX)) return undefined
  try {
    // get the correct url if it's a redirect
    const response = await axios.head(url, { timeout: 5000 })
    const realUrl = response.request.res.responseUrl
    const domain = new URL(realUrl).hostname
    return `https://api.faviconkit.com/${domain}/128`
  } catch (e) {
    if (axios.isAxiosError(e)) {
      logger.info('failed to get favicon', e.response)
    } else {
      logger.info('failed to get favicon', e)
    }
    return undefined
  }
}

// custom transformer to wrap <span class="highlight"> tags in markdown highlight tags `==`
export const highlightTranslators: TranslatorConfigObject = {
  /* Link */
  a: ({ node, options, visitor }) => {
    const href = node.getAttribute('href')
    if (!href) return {}

    // Encodes symbols that can cause problems in markdown
    let encodedHref = ''
    for (const chr of href) {
      switch (chr) {
        case '(':
          encodedHref += '%28'
          break
        case ')':
          encodedHref += '%29'
          break
        case '_':
          encodedHref += '%5F'
          break
        case '*':
          encodedHref += '%2A'
          break
        default:
          encodedHref += chr
      }
    }

    const title = node.getAttribute('title')

    let hasHighlight = false
    // If the link is a highlight, wrap it in `==` tags
    node.childNodes.forEach((child) => {
      if (
        child.nodeType === 1 &&
        (child as ElementNode).getAttribute(highlightIdAttribute)
      ) {
        hasHighlight = true
        return
      }
    })

    // Inline link, when possible
    // See: https://github.com/crosstype/node-html-markdown/issues/17
    if (node.textContent === href && options.useInlineLinks)
      return {
        prefix: hasHighlight ? '==' : undefined,
        postfix: hasHighlight ? '==' : undefined,
        content: `<${encodedHref}>`,
      }

    const prefix = hasHighlight ? '==[' : '['
    const postfix =
      ']' +
      (!options.useLinkReferenceDefinitions
        ? `(${encodedHref}${title ? ` "${title}"` : ''})`
        : `[${visitor.addOrGetUrlDefinition(encodedHref)}]`) +
      `${hasHighlight ? '==' : ''}`

    return {
      postprocess: ({ content }) => content.replace(/(?:\r?\n)+/g, ' '),
      childTranslators: visitor.instance.aTagTranslators,
      prefix,
      postfix,
    }
  },

  span: ({ node }) => {
    const id = node.getAttribute(highlightIdAttribute)
    if (!id) return {}

    const hasLeadingSpace = node.innerHTML.startsWith(' ')
    const hasTrailingSpace = node.innerHTML.endsWith(' ')
    // remove the leading and trailing space
    const content = node.innerHTML.trim()
    const prefix = hasLeadingSpace ? ' ==' : '=='
    const postfix = hasTrailingSpace ? '== ' : '=='

    return {
      prefix,
      postfix,
      content,
    }
  },
}

/* ********************************************************* *
 * Re-use
 * If using it several times, creating an instance saves time
 * ********************************************************* */
const nhm = new NodeHtmlMarkdown(
  /* options (optional) */ {},
  /* customTransformers (optional) */ highlightTranslators,
  /* customCodeBlockTranslators (optional) */ undefined
)

type contentConverterFunc = (html: string, highlights?: Highlight[]) => string

export const contentConverter = (
  format: string
): contentConverterFunc | undefined => {
  switch (format) {
    case ArticleFormat.Markdown:
      return (html: string) => {
        return ''
      }
    //      return htmlToMarkdown
    case ArticleFormat.HighlightedMarkdown:
      return (html: string) => {
        return ''
      }
    //      return htmlToHighlightedMarkdown
    default:
      return undefined
  }
}

export const htmlToHighlightedMarkdown = (
  html: string,
  highlights?: Highlight[]
): string => {
  if (!highlights || highlights.length == 0) {
    return nhm.translate(/* html */ html)
  }

  let document: Document

  try {
    document = parseHTML(html).document

    if (!document || !document.documentElement) {
      // the html is invalid
      throw new Error('Invalid html content')
    }
  } catch (err) {
    logger.error(err)
    return nhm.translate(/* html */ html)
  }

  const articleTextNodes = getArticleTextNodes(document)
  if (!articleTextNodes) {
    return nhm.translate(/* html */ html)
  }

  // wrap highlights in special tags
  highlights
    .filter((h) => h.highlightType == 'HIGHLIGHT' && h.patch)
    .forEach((highlight) => {
      try {
        makeHighlightNodeAttributes(
          highlight.id,
          highlight.patch as string,
          articleTextNodes
        )
      } catch (err) {
        logger.error(err)
      }
    })
  html = document.documentElement.outerHTML

  return nhm.translate(/* html */ html)
}

export const htmlToMarkdown = (html: string) => {
  return nhm.translate(/* html */ html)
}

export const markdownToHtml = (markdown: string) => {
  const converter = new showdown.Converter({
    backslashEscapesHTMLTags: true,
  })
  return converter.makeHtml(markdown)
}

export const getDistillerResult = async (
  uid: string,
  html: string
): Promise<string | undefined> => {
  try {
    const url = process.env.DISTILLER_URL
    if (!url) {
      logger.info('No distiller url')
      return undefined
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour
    const auth = (await signToken({ uid, exp }, env.server.jwtSecret)) as string

    logger.info(`Parsing by distiller: ${url}`)
    const response = await axios.post<string>(url, html, {
      headers: {
        Authorization: auth,
      },
      timeout: 5000,
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(error.response)
    } else {
      logger.error(error)
    }
    return undefined
  }
}

const fetchHtml = async (url: string): Promise<string | null> => {
  try {
    const response = await axiosInstance.get(url)
    return response.data as string
  } catch (error) {
    logger.error('Error fetching html', error)
    return null
  }
}

export const parseOpml = (opml: string): Feed[] | undefined => {
  const xmlParser = parser(true, { lowercase: true })
  const feeds: Feed[] = []
  const existingFeeds = new Map<string, boolean>()

  xmlParser.onopentag = function (node) {
    if (node.name === 'outline') {
      // folders also are outlines, make sure an xmlUrl is available
      const feedUrl = node.attributes.xmlUrl.toString()
      if (feedUrl && !existingFeeds.has(feedUrl)) {
        feeds.push({
          title: node.attributes.title.toString() || '',
          url: feedUrl,
          type: node.attributes.type.toString() || 'rss',
        })
        existingFeeds.set(feedUrl, true)
      }
    }
  }

  xmlParser.onend = function () {
    return feeds
  }

  try {
    xmlParser.write(opml).close()
  } catch (error) {
    logger.error('Error parsing opml', error)
    return undefined
  }
}

export const parseHtml = async (url: string): Promise<Feed[] | undefined> => {
  // fetch HTML and parse feeds
  const html = await fetchHtml(url)
  if (!html) return undefined

  try {
    const dom = parseHTML(html).document
    const links = dom.querySelectorAll('link[type="application/rss+xml"]')
    const feeds = Array.from(links)
      .map((link) => ({
        url: link.getAttribute('href') || '',
        title: link.getAttribute('title') || '',
        type: 'rss',
      }))
      .filter((feed) => feed.url)

    return feeds
  } catch (error) {
    logger.error('Error parsing html', error)
    return undefined
  }
}

export const parseFeed = async (
  url: string,
  content?: string | null
): Promise<Feed | null> => {
  try {
    // check if url is a telegram channel
    const telegramRegex = /https:\/\/t\.me\/([a-zA-Z0-9_]+)/
    const telegramMatch = url.match(telegramRegex)
    if (telegramMatch) {
      if (!content) {
        // fetch HTML and parse feeds
        content = await fetchHtml(url)
      }

      if (!content) return null

      const dom = parseHTML(content).document
      const title = dom.querySelector('meta[property="og:title"]')
      const thumbnail = dom.querySelector('meta[property="og:image"]')
      const description = dom.querySelector('meta[property="og:description"]')

      return {
        title: title?.getAttribute('content') || url,
        url,
        type: 'telegram',
        thumbnail: thumbnail?.getAttribute('content') || '',
        description: description?.getAttribute('content') || '',
      }
    }

    const parser = new Parser(rssParserConfig())

    const feed = content
      ? await parser.parseString(content)
      : await parser.parseURL(url)

    const feedUrl = feed.feedUrl || url

    return {
      title: feed.title || feedUrl,
      url: feedUrl,
      thumbnail: feed.image?.url,
      type: 'rss',
      description: feed.description,
    }
  } catch (error) {
    logger.error('Error parsing feed', error)
    return null
  }
}

const formatHighlightQuote = (quote: string): string => {
  // replace all empty lines with blockquote '>' to preserve paragraphs
  return quote.replace(/^(?=\n)$|^\s*?\n/gm, '> ')
}

export const highlightToMarkdown = (highlight: Highlight): string => {
  if (highlight.highlightType === HighlightType.Highlight && highlight.quote) {
    const quote = formatHighlightQuote(highlight.quote)
    const labels = highlight.labels?.map((label) => `#${label.name}`).join(' ')
    const note = highlight.annotation
    return `> ${quote} ${labels ? `\n\n${labels}` : ''}${
      note ? `\n\n${note}` : ''
    }`
  } else if (
    highlight.highlightType == HighlightType.Note &&
    highlight.annotation
  ) {
    const note = highlight.annotation
    return `${note}\n\n`
  }

  return ''
}
