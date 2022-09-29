import { AppleNewsHandler } from './apple-news-handler'
import { BloombergHandler } from './bloomberg-handler'
import { DerstandardHandler } from './derstandard-handler'
import { ImageHandler } from './image-handler'
import { MediumHandler } from './medium-handler'
import { PdfHandler } from './pdf-handler'
import { ScrapingBeeHandler } from './scrapingBee-handler'
import { TDotCoHandler } from './t-dot-co-handler'
import { TwitterHandler } from './twitter-handler'
import { YoutubeHandler } from './youtube-handler'
import {
  ContentHandler,
  NewsletterInput,
  NewsletterResult,
  PreHandleResult,
} from './content-handler'
import { SubstackHandler } from './substack-handler'
import { AxiosHandler } from './axios-handler'
import { GolangHandler } from './golang-handler'
import { MorningBrewHandler } from './morning-brew-handler'

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
  new SubstackHandler(),
  new AxiosHandler(),
  new GolangHandler(),
  new MorningBrewHandler(),
]

export const preHandleContent = async (
  url: string,
  dom?: Document
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
    if (handler.shouldPreHandle(url, dom)) {
      console.log('preHandleContent', handler.name, url)
      return handler.preHandle(url, dom)
    }
  }
  return undefined
}

export const handlerNewsletter = (
  input: NewsletterInput
): NewsletterResult | undefined => {
  for (const handler of contentHandlers) {
    if (handler.isNewsletter(input.postHeader, input.from, input.unSubHeader)) {
      return handler.handleNewsletter(input)
    }
  }

  return undefined
}

module.exports = {
  preHandleContent,
  handlerNewsletter,
}
