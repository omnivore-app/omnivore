import test from 'ava';
import {
  parse,
} from '../../src/parse';
import {
  test as liqeTest,
} from '../../src/test';

test('returns true if subject matches the query', (t) => {
  t.true(liqeTest(parse('david'), {
    height: 180,
    name: 'david',
  }));
});

test('returns false if subject does not match the query', (t) => {
  t.false(liqeTest(parse('mike'), {
    height: 180,
    name: 'david',
  }));
});
