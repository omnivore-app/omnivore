/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { JSDOM } from 'jsdom'
import { get } from 'lodash'
import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'
import { mapOrNull } from '../../../../utils/reactive'
import { slugify } from 'voca'
import {
  getFirstParagraphForEmbedding,
  removeHTMLTag,
  streamHeadAndRetrieveOpenGraph,
} from './generic'
import { OmnivoreFeed } from '../../../../../types/Feeds'

const getImage = (article: any): string | undefined => {
  // If there's a thumbnail exposed in the RSS Feed, we should default to that as it is the most likely
  if (article['media:thumbnail']) {
    return (
      get(article, '[media:thumbnail][@_url]') ||
      get(article, '[media:thumbnail][0][@_url]')
    )
  }

  // Otherwise, if there's Media Content, we should grab that, We will grab the first as it's the most likely
  // to represent the article.
  if (article['media:content']) {
    return (
      get(article, '[media:content][@_url]') ||
      get(article, '[media:content][0][@_url]')
    )
  }

  const extractImageFromHtml = (document: string) => {
    const dom = new JSDOM(document)
    return dom.window.document.getElementsByTagName('img')[0]?.src
  }

  // I've noticed some RSS feeds have some of the content encoded like this, and sometimes this contains an img tag
  if (article['content:encoded']) {
    const img = extractImageFromHtml(article['content:encoded'])
    if (img) {
      return img
    }
  }

  // Similarly, some of the descriptions are HTML based.
  if (article['description']) {
    const img = extractImageFromHtml(article['description'])
    if (img) {
      return img
    }
  }
}

const getDescription = (article: any): string | undefined => {
  // So first let's check there's some description.
  if (article['description']) {
    // Then we need to check if there's any <p> tags - If there are we enclose the entire thing in a DOM and do the extraction.
    if (/<p\b[^>]*>(.*?)<\/p>/g.test(article['description'])) {
      return getFirstParagraphForEmbedding(article['description'])
    }
    // If there aren't, then we should just use the description. It is likely correctly formatted.
    return article['description']
  }

  // Otherwise we might have the content HTML encoded in this, and we should grab it from here.
  if (article['content:encoded']) {
    return getFirstParagraphForEmbedding(article['content:encoded'])
  }

  return
}

const getDescriptionAndImage = async (article: any) => {
  let image = getImage(article)
  let description: string | undefined

  // If we do not have the image, we should try to grab the image and description from the
  // <head> of the HTML page (using OpenGraph data). We may no longer need to grab the description from the RSS feed at this point.
  if (!image) {
    const ogData = await streamHeadAndRetrieveOpenGraph(article.link)
    image = ogData.image
    description = ogData.description
  }

  if (!description) {
    description = getDescription(article)
  }

  return { image, description }
}

export const parseRss = (feed: OmnivoreFeed) => (parsedXml: any) => {
  return fromArrayLike(parsedXml).pipe(
    mapOrNull(async (article: any) => {
      const { description, image } = await getDescriptionAndImage(article)

      return {
        authors: article['dc:creator'],
        slug: slugify(article.link),
        url: article.link,
        title: removeHTMLTag(article.title),
        description: description ?? '',
        summary: description ?? '',
        image: image ?? '',
        site: new URL(article.link).host,
        publishedAt: new Date(
          article.pubDate ?? article['dc:date'] ?? Date.now()
        ),
        type: 'rss',
        feedId: feed.id,
      }
    })
  )
}
