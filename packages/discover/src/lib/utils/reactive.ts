import {
  concatMap,
  delay, EMPTY,
  MonoTypeOperatorFunction,
  Observable, ObservableInput, ObservedValueOf,
  of,
  pipe,
  timer,
} from "rxjs";
import {map, retry} from "rxjs/operators";
import {OmnivoreArticle} from "../../types/OmnivoreArticle";

export const exponentialBackOff = <T>(
  count: number,
): MonoTypeOperatorFunction<T> =>
  retry({
    count,
    delay: (error, retryIndex) => {
      console.log("Backing off", retryIndex);
      const interval = 200;
      const delay = Math.pow(2, retryIndex - 1) * interval;
      return timer(delay);
    },
  });

export const rateLimiter = <T>(params: {
  resetLimit: number;
  timeMs: number;
}) =>
  concatMap((it: T) => of(it).pipe(delay(params.timeMs / params.resetLimit)));


export function mapOrNull(project: (article: any) => OmnivoreArticle) {
  return pipe(
      concatMap((item: any, value:number) => {
    try {
      return of(project(item))
    } catch (e) {
      return EMPTY
    }
  })
  )

}