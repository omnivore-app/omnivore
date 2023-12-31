import {
  concatMap,
  delay,
  EMPTY,
  mergeMap,
  MonoTypeOperatorFunction,
  Observable,
  of,
  pipe,
  tap,
  timer,
} from 'rxjs'
import { filter, retry } from 'rxjs/operators'
import { OmnivoreArticle } from '../../types/OmnivoreArticle'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'

export const exponentialBackOff = <T>(
  count: number,
): MonoTypeOperatorFunction<T> =>
  retry({
    count,
    delay: (error, retryIndex) => {
      console.log('Backing off', retryIndex)
      const interval = 200
      const delay = Math.pow(2, retryIndex - 1) * interval
      return timer(delay)
    },
  })

export const rateLimiter = <T>(params: {
  resetLimit: number
  timeMs: number
}) =>
  concatMap((it: T) => of(it).pipe(delay(params.timeMs / params.resetLimit)))

export function mapOrNull(project: (article: any) => Promise<OmnivoreArticle>) {
  return pipe(
    concatMap((item: any, _value: number) => {
      try {
        return fromPromise(project(item).catch((_e) => null)).pipe(
          filter((it) => !!it),
        ) as Observable<OmnivoreArticle>
      } catch (e) {
        return EMPTY
      }
    }),
  )
}
