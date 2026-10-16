import {
  isSafePath,
} from './isSafePath';

export const createGetValueFunctionBody = (path: string): string => {
  if (!isSafePath(path)) {
    throw new Error('Unsafe path.');
  }

  const body = 'return subject' + path;

  return body
    .replace(/(\.(\d+))/g, '.[$2]')
    .replace(/\./g, '?.');
};
