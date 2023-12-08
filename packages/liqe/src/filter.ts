import {
  internalFilter,
} from './internalFilter';
import type {
  LiqeQuery,
} from './types';

export const filter = <T extends Object>(
  ast: LiqeQuery,
  data: readonly T[],
): readonly T[] => {
  return internalFilter(
    ast,
    data,
  );
};
