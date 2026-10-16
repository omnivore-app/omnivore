import test from 'ava';
import {
  isSafeUnquotedExpression,
} from '../../src/isSafeUnquotedExpression';

const testExpression = (t, expected) => {
  t.is(isSafeUnquotedExpression(t.title), expected);
};

test('foo', testExpression, true);

test('.foo', testExpression, false);
