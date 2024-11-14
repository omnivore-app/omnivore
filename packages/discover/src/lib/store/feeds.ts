import { concatMap, from, mergeMap, Observable, of, tap } from 'rxjs'
import { sqlClient } from './db'
import { OmnivoreFeed } from '../../types/Feeds'
import { fromPromise, fromArrayLike } from 'rxjs/internal/observable/innerFrom'

export const getRssFeeds$: Observable<OmnivoreFeed> = fromArrayLike([
  'restart',
]).pipe(
  concatMap(() =>
    fromPromise(
      (async (): Promise<OmnivoreFeed[]> => {
        const { rows } = (await sqlClient.query(
          `SELECT * FROM omnivore.discover_feed WHERE title != 'OMNIVORE_COMMUNITY'`
        )) as { rows: OmnivoreFeed[] }

        return rows
      })()
    )
  ),
  tap(console.log),
  mergeMap((it: OmnivoreFeed[]) => fromArrayLike(it))
)
