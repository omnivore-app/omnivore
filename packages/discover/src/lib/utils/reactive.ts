import {
  catchError,
  concatMap,
  delay,
  EMPTY,
  mergeMap,
  MonoTypeOperatorFunction,
  Observable,
  of,
  OperatorFunction,
  pipe,
  timer,
} from 'rxjs'
import { filter, retry } from 'rxjs/operators'
import { OmnivoreArticle } from '../../types/OmnivoreArticle'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'

export const exponentialBackOff = <T>(
  count: number
): MonoTypeOperatorFunction<T> =>
  retry({
    count,
    delay: (error, retryIndex, interval = 200) => {
      const delay = Math.pow(2, retryIndex - 1) * interval
      console.log(
        `Backing off: attempt ${retryIndex}, Trying again in: ${delay}ms`
      )

      return timer(delay)
    },
  })

export const onErrorContinue = (...pipes: OperatorFunction<any, any>[]) =>
  mergeMap((it: any) => {
    let observer: Observable<any> = of(it)
    pipes.forEach((pipe) => {
      observer = observer.pipe(pipe)
    })

    return observer.pipe(
      catchError((e) => {
        console.error('Error caught in pipe, skipping', e)
        return EMPTY
      })
    )
  })

export const rateLimiter = <T>(params: {
  resetLimit: number
  timeMs: number
}) => {
  return concatMap((it: T) => {
    return of(it).pipe(delay(params.timeMs / params.resetLimit))
  })
}

export function mapOrNull(project: (article: any) => Promise<OmnivoreArticle>) {
  return pipe(
    concatMap((item: any, _value: number) => {
      try {
        return fromPromise(project(item).catch((_e) => null)).pipe(
          filter((it) => !!it)
        ) as Observable<OmnivoreArticle>
      } catch (e) {
        return EMPTY
      }
    })
  )
}
