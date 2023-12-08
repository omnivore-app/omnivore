/* eslint-disable fp/no-class */

import {
  ExtendableError,
} from 'ts-error';

export class LiqeError extends ExtendableError {}

export class SyntaxError extends LiqeError {
  public constructor (
    public message: string,
    public offset: number,
    public line: number,
    public column: number,
  ) {
    super(message);
  }
}
