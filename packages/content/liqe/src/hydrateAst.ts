/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable no-new-func */

import {
  createGetValueFunctionBody,
} from './createGetValueFunctionBody';
import {
  isSafePath,
} from './isSafePath';
import type {
  ParserAst,
  LiqeQuery,
} from './types';

export const hydrateAst = (subject: ParserAst): LiqeQuery => {
  const newSubject: LiqeQuery = {
    ...subject,
  };

  if (
    subject.type === 'Tag' &&
    subject.field.type === 'Field' &&
    'field' in subject &&
    isSafePath(subject.field.name)
  ) {
    newSubject.getValue = new Function('subject', createGetValueFunctionBody(subject.field.name)) as (subject: unknown) => unknown;
  }

  if ('left' in subject) {
    newSubject.left = hydrateAst(subject.left);
  }

  if ('right' in subject) {
    newSubject.right = hydrateAst(subject.right);
  }

  if ('operand' in subject) {
    newSubject.operand = hydrateAst(subject.operand);
  }

  return newSubject;
};
