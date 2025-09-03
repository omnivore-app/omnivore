import {
  concatMap,
  merge,
  mergeAll,
  mergeMap,
  Observable,
  tap,
  timer,
} from 'rxjs'
import axios from 'axios'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import { OmnivoreArticle } from '../../../../types/OmnivoreArticle'
import converters from './rssConverters/converters'
import { filter, finalize } from 'rxjs/operators'
import { getRssFeeds$ } from '../../../store/feeds'
import { OmnivoreContentFeed, OmnivoreFeed } from '../../../../types/Feeds'
import { newFeeds$ } from './newFeedIngestor'
import { exponentialBackOff, onErrorContinue } from '../../../utils/reactive'

const REFRESH_DELAY_MS = /*3_600_000*/ 300000;
const getRssFeed = async (
  feed: OmnivoreFeed
): Promise<OmnivoreContentFeed | null> => {
  try {
    const rss = await axios.get<string>(feed.link)
    return {
      feed,
      content: rss.data,
    }
  } catch (e) {
    console.error('Error retrieving RSS Feed Content', e)
    throw e
  }
}

const rssToArticles = (site: OmnivoreFeed) =>
  fromPromise(getRssFeed(site)).pipe(
    filter((it): it is OmnivoreContentFeed => !!it),
    mergeMap<OmnivoreContentFeed, Observable<OmnivoreArticle>>((item) =>
      converters.generic(item)
    )
  )

export const rss$ = (() => {
  let lastUpdatedTime = new Date(0)

  const filteredRss$ = getRssFeeds$.pipe(
    onErrorContinue(
      mergeMap((it) => rssToArticles(it).pipe(exponentialBackOff(5)))
    ),
    finalize(() => {
      lastUpdatedTime = new Date()
      console.log(lastUpdatedTime)
    })
  )

  return merge(
    newFeeds$.pipe(
      onErrorContinue(
        mergeMap((it) => rssToArticles(it).pipe(exponentialBackOff(5)))
      )
    ),
    timer(0, REFRESH_DELAY_MS).pipe(
      tap((e) => console.log('Refreshing Stream')),
      concatMap(() => filteredRss$)
    )
  )

})()
