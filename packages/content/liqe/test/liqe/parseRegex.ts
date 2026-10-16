import test from 'ava';
import {
  parseRegex,
} from '../../src/parseRegex';

const EMAIL_REGEX = /[^.:@\\s](?:[^:@\\s]*[^.:@\\s])?@[^.@\\s]+(?:\\.[^.@\\s]+)*/;

const testRule = test.macro((t, regex: RegExp) => {
  t.deepEqual(parseRegex(t.title), regex);
});

test('/foo/', testRule, /foo/);
test('/foo/u', testRule, /foo/u);
test('/foo', testRule, /\/foo/);
test('foo/bar', testRule, /foo\/bar/);
test('/foo/bar/', testRule, /foo\/bar/);
test(String(EMAIL_REGEX), testRule, EMAIL_REGEX);

