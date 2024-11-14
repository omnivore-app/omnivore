import { concatMap, mergeMap, Observable, tap } from 'rxjs'
import { sqlClient } from './db'
import { OmnivoreFeed } from '../../types/Feeds'
import { fromPromise, fromArrayLike } from 'rxjs/internal/observable/innerFrom'

export const getRssFeeds$: Observable<OmnivoreFeed> = fromArrayLike([]).pipe(
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
  tap(() => console.log('test')),
  tap(console.log),
  mergeMap((it) => it as Observable<OmnivoreFeed>)
)
