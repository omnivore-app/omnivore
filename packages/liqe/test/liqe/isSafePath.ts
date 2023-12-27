import test from 'ava';
import {
  isSafePath,
} from '../../src/isSafePath';

const testPath = (t, expected) => {
  t.is(isSafePath(t.title), expected);
};

test('.a', testPath, true);
test('.a.b', testPath, true);

test('.foo', testPath, true);
test('.foo.bar', testPath, true);

test('._foo', testPath, true);
test('._foo._bar', testPath, true);

test('.foo0', testPath, true);
test('.foo0.bar1', testPath, true);

test('.1', testPath, true);
test('.10', testPath, true);

test('foo', testPath, false);
test('.foo..bar', testPath, false);
test('.foo bar', testPath, false);
test('.foo[0]', testPath, false);

test('.00', testPath, false);
test('.01', testPath, false);

