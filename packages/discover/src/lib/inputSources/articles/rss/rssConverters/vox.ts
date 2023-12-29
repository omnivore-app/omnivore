import { OmnivoreArticle } from '../../../../../types/OmnivoreArticle'
import { slugify } from 'voca'
import { XMLParser } from 'fast-xml-parser'
import { Observable, tap } from 'rxjs'
import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'
import { mapOrNull } from '../../../../utils/reactive'
import { parseHTML } from 'linkedom'

const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true })

const removeHTMLTag = (text: string): string => {
  return text.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, '')
}

const getFirstParagraphForEmbedding = (text: string): string => {
  const html = parseHTML(`<html>${text}</html>`)
  return (
    (html.document.querySelectorAll('p')[0] &&
      removeHTMLTag(html.document.querySelectorAll('p')[0].innerHTML)
        .split(' ')
        .slice(0, 100)
        .join(' ')) ||
    ''
  )
}

const getHeaderImage = (text: string): string => {
  const html = parseHTML(`<html>${text}</html>`)
  return (
    (html.document.querySelectorAll('img')[0] &&
      removeHTMLTag(html.document.querySelectorAll('img')[0].src)) ||
    ''
  )
}

export const convertVoxArticle = (
  articleXml: string,
): Observable<OmnivoreArticle> => {
  return fromArrayLike(parser.parse(articleXml).feed.entry).pipe(
    mapOrNull(
      (article: any): OmnivoreArticle => ({
        authors: Array.isArray(article.author.name)
          ? article.author.name[0]
          : article.author.name,
        slug: slugify(article.link['@_href']),
        url: article.link['@_href'],
        title: removeHTMLTag(article.title),
        description: getFirstParagraphForEmbedding(article.content['#text']),
        summary: getFirstParagraphForEmbedding(article.content['#text']),
        image: getHeaderImage(article.content['#text']),
        site: new URL(article.link['@_href']).host,
        publishedAt: new Date(article.published),
        type: 'rss',
      }),
    ),
  )
}
