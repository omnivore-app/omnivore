import { mergeMap, Observable, OperatorFunction } from 'rxjs'
import { sqlClient } from './db'
import { OmnivoreFeed } from '../../types/Feeds'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'

export const getRssFeeds$ = fromPromise(
  (async (): Promise<OmnivoreFeed[]> => {
    const { rows } = (await sqlClient.query(
      `SELECT * FROM omnivore.discover_feed WHERE title != 'OMNIVORE_COMMUNITY'`
    )) as { rows: OmnivoreFeed[] }

    return rows
  })()
).pipe(mergeMap((it) => it))
