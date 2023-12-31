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
  'https://www.vox.com/rss/index.xml',
  'https://www.wired.com/feed/rss',
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://slate.com/feeds/all.rss',
  // 'https://feeds.bbci.co.uk/news/rss.xml',
  // 'https://www.theguardian.com/world/rss',
  // 'http://www.independent.co.uk/news/uk/rss',
  // 'https://www.makeuseof.com/feed/',
  // 'https://rss.slashdot.org/Slashdot/slashdotMain',
]

const rssToArticles = (site: string) =>
  fromPromise(getRssFeed(site)).pipe(
    mergeMap((item) => converters.generic(item)),
  )

export const rss$ = (() => {
  let lastUpdatedTime = new Date(0)

  const allRss$ = fromArrayLike(RSS_FEEDS).pipe(
    mergeMap((it) => rssToArticles(it)),
    filter((it: OmnivoreArticle) => it.publishedAt > lastUpdatedTime),
    finalize(() => (lastUpdatedTime = new Date())),
  )

  return timer(0, REFRESH_DELAY_MS).pipe(concatMap(() => allRss$))
})()
