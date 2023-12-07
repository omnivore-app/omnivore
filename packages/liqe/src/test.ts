import {
  filter,
} from './filter';
import type {
  LiqeQuery,
} from './types';

export const test = <T extends Object>(ast: LiqeQuery, subject: T) => {
  return filter(ast, [subject]).length === 1;
};
