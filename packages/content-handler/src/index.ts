import { AppleNewsHandler } from './websites/apple-news-handler'
import { BloombergHandler } from './websites/bloomberg-handler'
import { DerstandardHandler } from './websites/derstandard-handler'
import { ImageHandler } from './websites/image-handler'
import { MediumHandler } from './websites/medium-handler'
import { PdfHandler } from './websites/pdf-handler'
import { ScrapingBeeHandler } from './websites/scrapingBee-handler'
import { TDotCoHandler } from './websites/t-dot-co-handler'
import { TwitterHandler } from './websites/twitter-handler'
import { YoutubeHandler } from './websites/youtube-handler'
import { WikipediaHandler } from './websites/wikipedia-handler'
import { GitHubHandler } from './websites/github-handler'
import {
  ContentHandler,
  NewsletterInput,
  NewsletterResult,
  PreHandleResult,
} from './content-handler'
import { SubstackHandler } from './newsletters/substack-handler'
import { AxiosHandler } from './newsletters/axios-handler'
import { GolangHandler } from './newsletters/golang-handler'
import { MorningBrewHandler } from './newsletters/morning-brew-handler'
import { BloombergNewsletterHandler } from './newsletters/bloomberg-newsletter-handler'
import { BeehiivHandler } from './newsletters/beehiiv-handler'
import { ConvertkitHandler } from './newsletters/convertkit-handler'
import { RevueHandler } from './newsletters/revue-handler'
import { GhostHandler } from './newsletters/ghost-handler'
import { parseHTML } from 'linkedom'
import { CooperPressHandler } from './newsletters/cooper-press-handler'
import { HeyWorldHandler } from './newsletters/hey-world-handler'

const validateUrlString = (url: string) => {
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

const contentHandlers: ContentHandler[] = [
  new AppleNewsHandler(),
  new BloombergHandler(),
  new DerstandardHandler(),
  new ImageHandler(),
  new MediumHandler(),
  new PdfHandler(),
  new ScrapingBeeHandler(),
  new TDotCoHandler(),
  new TwitterHandler(),
  new YoutubeHandler(),
  new WikipediaHandler(),
  new GitHubHandler(),
  new AxiosHandler(),
  new GolangHandler(),
  new MorningBrewHandler(),
  new BloombergNewsletterHandler(),
  new SubstackHandler(),
]

const newsletterHandlers: ContentHandler[] = [
  new AxiosHandler(),
  new BloombergNewsletterHandler(),
  new GolangHandler(),
  new SubstackHandler(),
  new MorningBrewHandler(),
  new BeehiivHandler(),
  new ConvertkitHandler(),
  new RevueHandler(),
  new GhostHandler(),
  new CooperPressHandler(),
  new HeyWorldHandler(),
]

export const preHandleContent = async (
  url: string
): Promise<PreHandleResult | undefined> => {
  // Before we run the regular handlers we check to see if we need tp
  // pre-resolve the URL. TODO: This should probably happen recursively,
  // so URLs can be pre-resolved, handled, pre-resolved, handled, etc.
  for (const handler of contentHandlers) {
    if (handler.shouldResolve(url)) {
      try {
        const resolvedUrl = await handler.resolve(url)
        if (resolvedUrl && validateUrlString(resolvedUrl)) {
          url = resolvedUrl
        }
      } catch (err) {
        console.log('error resolving url with handler', handler.name, err)
      }
      break
    }
  }
  // Before we fetch the page we check the handlers, to see if they want
  // to perform a prefetch action that can modify our requests.
  // enumerate the handlers and see if any of them want to handle the request
  for (const handler of contentHandlers) {
    if (handler.shouldPreHandle(url)) {
      console.log('preHandleContent', handler.name, url)
      return handler.preHandle(url)
    }
  }
  return undefined
}

export const preParseContent = async (
  url: string,
  dom: Document
): Promise<Document | undefined> => {
  // Before we parse the page we check the handlers, to see if they want
  // to perform a preParse action that can modify our dom.
  // enumerate the handlers and see if any of them want to handle the dom
  for (const handler of contentHandlers) {
    if (handler.shouldPreParse(url, dom)) {
      console.log('preParseContent', handler.name, url)
      return handler.preParse(url, dom)
    }
  }
  return undefined
}

export const getNewsletterHandler = async (input: {
  postHeader: string
  from: string
  unSubHeader: string
  html: string
}): Promise<ContentHandler | undefined> => {
  const dom = parseHTML(input.html).document
  for (const handler of newsletterHandlers) {
    if (await handler.isNewsletter({ ...input, dom })) {
      return handler
    }
  }

  return undefined
}

export const handleNewsletter = async (
  input: NewsletterInput
): Promise<NewsletterResult | undefined> => {
  const handler = await getNewsletterHandler(input)
  if (handler) {
    console.log('handleNewsletter', handler.name, input.title)
    return handler.handleNewsletter(input)
  }

  return undefined
}

module.exports = {
  preHandleContent,
  handleNewsletter,
  preParseContent,
  getNewsletterHandler,
}
