/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { slugify } from 'voca'
import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'
import { mapOrNull } from '../../../../utils/reactive'
import {
  getFirstParagraphForEmbedding,
  removeHTMLTag,
  streamHeadAndRetrieveOpenGraph,
} from './generic'
import { JSDOM } from 'jsdom'
import { OmnivoreFeed } from '../../../../../types/Feeds'

const getImage = (article: any): string | undefined => {
  const html = new JSDOM(`<html>${article.content['#text']}</html>`)
  return (
    (html.window.document.querySelectorAll('img')[0] &&
      removeHTMLTag(html.window.document.querySelectorAll('img')[0].src)) ||
    undefined
  )
}

const getDescription = (article: any): string | undefined => {
  return getFirstParagraphForEmbedding(article.content['#text'])
}

const getDescriptionAndImage = async (article: any) => {
  let image = getImage(article)
  let description: string | undefined

  // If we do not have the image, we should try to grab the image and description from the
  // <head> of the HTML page (using OpenGraph data). We may no longer need to grab the description from the RSS feed at this point.
  if (!image) {
    const ogData = await streamHeadAndRetrieveOpenGraph(article.link['@_href'])
    image = ogData.image
    description = ogData.description
  }

  if (!description) {
    description = getDescription(article)
  }

  return { image, description }
}

export const convertAtomStream = (feed: OmnivoreFeed) => (parsedXml: any) => {
  return fromArrayLike(parsedXml.feed.entry).pipe(
    mapOrNull(async (article: any) => {
      const { image, description } = await getDescriptionAndImage(article)

      return {
        authors: Array.isArray(article.author.name)
          ? article.author.name[0]
          : article.author.name,
        slug: slugify(article.link['@_href']),
        url: article.link['@_href'],
        title: removeHTMLTag(article.title),
        description: description ?? '',
        summary: description ?? '',
        image: image ?? '',
        site: new URL(article.link['@_href']).host,
        publishedAt: new Date(article.published ?? Date.now()),
        type: 'rss',
        feedId: feed.title,
      }
    })
  )
}
