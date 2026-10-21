import type {
  Range,
} from './types';

export const testRange = (value: unknown, range: Range): boolean => {
  if (typeof value === 'number') {
    if (value < range.min) {
      return false;
    }

    if (value === range.min && !range.minInclusive) {
      return false;
    }

    if (value > range.max) {
      return false;
    }

    if (value === range.max && !range.maxInclusive) {
      return false;
    }

    return true;
  }

  // @todo handle non-numeric ranges -- https://github.com/gajus/liqe/issues/3

  return false;
};
