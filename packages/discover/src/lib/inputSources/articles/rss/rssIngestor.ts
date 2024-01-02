import { concatMap, merge, mergeAll, mergeMap, Observable, timer } from 'rxjs'
import axios from 'axios'
import { fromArrayLike, fromPromise } from 'rxjs/internal/observable/innerFrom'
import { OmnivoreArticle } from '../../../../types/OmnivoreArticle'
import converters from './rssConverters/converters'
import { filter, finalize } from 'rxjs/operators'
import { getRssFeeds$ } from '../../../store/feeds'
import { OmnivoreContentFeed, OmnivoreFeed } from '../../../../types/Feeds'
import { newFeeds$ } from './newFeedIngestor'

const REFRESH_DELAY_MS = 3_600_000
const getRssFeed = async (
  feed: OmnivoreFeed,
): Promise<OmnivoreContentFeed | null> => {
  try {
    const rss = await axios.get<string>(feed.link)
    return {
      feed,
      content: rss.data,
    }
  } catch (e) {
    console.error('Error retrieving RSS Feed Content', e)
    return null
  }
}

const rssToArticles = (site: OmnivoreFeed) =>
  fromPromise(getRssFeed(site)).pipe(
    filter((it): it is OmnivoreContentFeed => !!it),
    mergeMap<OmnivoreContentFeed, Observable<OmnivoreArticle>>((item) =>
      converters.generic(item),
    ),
  )

export const rss$ = (() => {
  let lastUpdatedTime = new Date(0)

  const allRss$ = merge(getRssFeeds$, newFeeds$).pipe(
    mergeMap((it) => rssToArticles(it)),
    filter((it: OmnivoreArticle) => it.publishedAt > lastUpdatedTime),
    finalize(() => (lastUpdatedTime = new Date())),
  )

  return timer(0, REFRESH_DELAY_MS).pipe(concatMap(() => allRss$))
})()
