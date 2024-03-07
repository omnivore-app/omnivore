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
import { fromArrayLike, fromPromise } from 'rxjs/internal/observable/innerFrom'
import { OmnivoreArticle } from '../../../../types/OmnivoreArticle'
import converters from './rssConverters/converters'
import { filter, finalize } from 'rxjs/operators'
import { getRssFeeds$ } from '../../../store/feeds'
import { OmnivoreContentFeed, OmnivoreFeed } from '../../../../types/Feeds'
import { newFeeds$ } from './newFeedIngestor'
import { exponentialBackOff, onErrorContinue } from '../../../utils/reactive'

const REFRESH_DELAY_MS = 3_600_000
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
    filter((it: OmnivoreArticle) => it.publishedAt > lastUpdatedTime),
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

  // return fromArrayLike([
  //   {
  //     id: 'ABC',
  //     description:
  //       'Though AI companies said they put some guardrails in place, researchers were able to easily create images related to claims of election fraud.',
  //     image: 'string',
  //     link: 'https://www.wired.com/story/genai-images-election-fraud/',
  //     title: 'AI Tools Are Still Generating Misleading Election Images',
  //     type: 'RSS',
  //   },
  // ])
})()
