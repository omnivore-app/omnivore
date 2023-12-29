import { concatMap, mergeMap, Observable, timer } from 'rxjs'
import axios from 'axios'
import { fromArrayLike, fromPromise } from 'rxjs/internal/observable/innerFrom'
import { OmnivoreArticle } from '../../../../types/OmnivoreArticle'
import converters from './rssConverters/converters'
import { filter, finalize } from 'rxjs/operators'

const REFRESH_DELAY_MS = 3_600_000
const getRssFeed = async (url: string): Promise<string> => {
  const rss = await axios.get<string>(url)
  return rss.data
}

const RSS_FEEDS = [
  {
    site: 'https://www.vox.com/rss/index.xml',
    parser: converters.vox,
  },
  {
    site: 'https://www.wired.com/feed/rss',
    parser: converters.wired,
  },
  {
    site: 'https://feeds.arstechnica.com/arstechnica/index',
    parser: converters.arstechnica,
  },
  {
    site: 'https://slate.com/feeds/all.rss',
    parser: converters.slate,
  },
]

const rssToArticles = ({
  site,
  parser,
}: {
  site: string
  parser: (xml: string) => Observable<OmnivoreArticle>
}) => fromPromise(getRssFeed(site)).pipe(mergeMap((item) => parser(item)))

export const rss$ = (() => {
  let lastUpdatedTime = new Date(0)

  const allRss$ = fromArrayLike(RSS_FEEDS).pipe(
    mergeMap((it) => rssToArticles(it)),
    filter((it: OmnivoreArticle) => it.publishedAt > lastUpdatedTime),
    finalize(() => (lastUpdatedTime = new Date())),
  )

  return timer(0, REFRESH_DELAY_MS).pipe(concatMap(() => allRss$))
})()
