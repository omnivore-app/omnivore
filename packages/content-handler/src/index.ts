import { parseHTML } from 'linkedom'
import {
  ContentHandler,
  NewsletterInput,
  NewsletterResult,
  PreHandleResult,
} from './content-handler'
import { AxiosHandler } from './newsletters/axios-handler'
import { BeehiivHandler } from './newsletters/beehiiv-handler'
import { BloombergNewsletterHandler } from './newsletters/bloomberg-newsletter-handler'
import { ConvertkitHandler } from './newsletters/convertkit-handler'
import { CooperPressHandler } from './newsletters/cooper-press-handler'
import { EnergyWorldHandler } from './newsletters/energy-world'
import { EveryIoHandler } from './newsletters/every-io-handler'
import { GenericHandler } from './newsletters/generic-handler'
import { GhostHandler } from './newsletters/ghost-handler'
import { GolangHandler } from './newsletters/golang-handler'
import { HeyWorldHandler } from './newsletters/hey-world-handler'
import { IndiaTimesHandler } from './newsletters/india-times-handler'
import { MorningBrewHandler } from './newsletters/morning-brew-handler'
import { RevueHandler } from './newsletters/revue-handler'
import { SubstackHandler } from './newsletters/substack-handler'
import { AppleNewsHandler } from './websites/apple-news-handler'
import { ArsTechnicaHandler } from './websites/ars-technica-handler'
import { BloombergHandler } from './websites/bloomberg-handler'
import { DerstandardHandler } from './websites/derstandard-handler'
import { GitHubHandler } from './websites/github-handler'
import { ImageHandler } from './websites/image-handler'
import { MediumHandler } from './websites/medium-handler'
import { PdfHandler } from './websites/pdf-handler'
import { PipedVideoHandler } from './websites/piped-video-handler'
import { ScrapingBeeHandler } from './websites/scrapingBee-handler'
import { StackOverflowHandler } from './websites/stack-overflow-handler'
import { TDotCoHandler } from './websites/t-dot-co-handler'
import { TheAtlanticHandler } from './websites/the-atlantic-handler'
import { TwitterHandler } from './websites/twitter-handler'
import { WeixinQqHandler } from './websites/weixin-qq-handler'
import { WikipediaHandler } from './websites/wikipedia-handler'
import { YoutubeHandler } from './websites/youtube-handler'
import { ZhihuHandler } from './websites/zhihu-handler'
import { TikTokHandler } from './websites/tiktok-handler'
import { RawContentHandler } from './websites/raw-handler'

const validateUrlString = (url: string): boolean => {
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

  return true
}

const contentHandlers: ContentHandler[] = [
  new ArsTechnicaHandler(),
  new TheAtlanticHandler(),
  new AppleNewsHandler(),
  new BloombergHandler(),
  new DerstandardHandler(),
  new ImageHandler(),
  new MediumHandler(),
  new RawContentHandler(),
  new PdfHandler(),
  new ScrapingBeeHandler(),
  new TDotCoHandler(),
  new YoutubeHandler(),
  new WikipediaHandler(),
  new GitHubHandler(),
  new AxiosHandler(),
  new GolangHandler(),
  new MorningBrewHandler(),
  new BloombergNewsletterHandler(),
  new SubstackHandler(),
  new StackOverflowHandler(),
  new EnergyWorldHandler(),
  new PipedVideoHandler(),
  new WeixinQqHandler(),
  new ZhihuHandler(),
  new TwitterHandler(),
  new TikTokHandler(),
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
  new GenericHandler(),
  new EveryIoHandler(),
  new EnergyWorldHandler(),
  new IndiaTimesHandler(),
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
  from: string
  html: string
  headers: Record<string, string | string[]>
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
    console.log('handleNewsletter', handler.name, input.subject)
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
