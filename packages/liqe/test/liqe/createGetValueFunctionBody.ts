import test from 'ava';
import {
  createGetValueFunctionBody,
} from '../../src/createGetValueFunctionBody';

const testPath = (t, expected) => {
  t.is(createGetValueFunctionBody(t.title), expected);
};

const testThrows = (t) => {
  t.throws(() => {
    createGetValueFunctionBody(t.title);
  });
};

test('.a', testPath, 'return subject?.a');
test('.a.b', testPath, 'return subject?.a?.b');

test('.foo', testPath, 'return subject?.foo');
test('.foo.bar', testPath, 'return subject?.foo?.bar');

test('._foo', testPath, 'return subject?._foo');
test('._foo._bar', testPath, 'return subject?._foo?._bar');

test('.foo0', testPath, 'return subject?.foo0');
test('.foo0.bar1', testPath, 'return subject?.foo0?.bar1');

test('.1', testPath, 'return subject?.[1]');
test('.10', testPath, 'return subject?.[10]');

test('foo', testThrows);
test('.foo..bar', testThrows);
test('.foo bar', testThrows);
test('.foo[0]', testThrows);

test('.00', testThrows);
test('.01', testThrows);
