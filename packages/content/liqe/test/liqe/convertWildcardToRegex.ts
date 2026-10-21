import test from 'ava';
import {
  convertWildcardToRegex,
} from '../../src/convertWildcardToRegex';

const testRule = test.macro((t, regex: RegExp) => {
  t.deepEqual(convertWildcardToRegex(t.title), regex);
});

test('*', testRule, /(.+?)/);
test('?', testRule, /(.)/);
test('foo*bar', testRule, /foo(.+?)bar/);
test('foo***bar', testRule, /foo(.+?)bar/);
test('foo*bar*', testRule, /foo(.+?)bar(.+?)/);
test('foo?bar', testRule, /foo(.)bar/);
test('foo???bar', testRule, /foo(.)(.)(.)bar/);
