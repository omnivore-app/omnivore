import { OmnivoreArticle } from '../../../../../types/OmnivoreArticle'
import { slugify } from 'voca'
import { XMLParser } from 'fast-xml-parser'
import { Observable } from 'rxjs'
import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'
import { mapOrNull } from '../../../../utils/reactive'

const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true })

export const convertAtlanticArticles = (
  articleXml: string
): Observable<OmnivoreArticle> => {
  return fromArrayLike(parser.parse(articleXml).feed.entry).pipe(
    mapOrNull(
      (article: any): OmnivoreArticle => ({
        authors: article.author.name,
        slug: slugify(article.link['@_href']),
        url: article.link['@_href'],
        title: article.title['#text'],
        description: article.summary['#text'],
        image: article['media:content']
          ? article['media:content']['@_url']
          : '',
        site: new URL(article.link['@_href']).host,
        publishedAt: new Date(article.published),
        type: 'rss',
      })
    )
  )
}
