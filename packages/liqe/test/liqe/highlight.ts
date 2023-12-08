import test from 'ava';
import {
  highlight,
} from '../../src/highlight';
import {
  parse,
} from '../../src/parse';
import type {
  Highlight,
} from '../../src/types';

const testQuery = test.macro(<T extends Object>(t, query: string, subject: T, highlights: Highlight[]) => {
  t.deepEqual(highlight(parse(query), subject), highlights);
});

test.skip(
  'matches every property',
  testQuery,
  '*',
  {
    email: 'foo@bar.com',
    name: 'foo bar',
  },
  [
    {
      path: 'email',
      query: /(foo@bar.com)/,
    },
    {
      keyword: /(foo bar)/,
      path: 'name',
    },
  ],
);

test(
  'matches any property',
  testQuery,
  'foo',
  {
    email: 'foo@bar.com',
    name: 'foo bar',
  },
  [
    {
      path: 'email',
      query: /(foo)/,
    },
    {
      path: 'name',
      query: /(foo)/,
    },
  ],
);

test(
  'matches property',
  testQuery,
  'name:foo',
  {
    name: 'foo bar',
  },
  [
    {
      path: 'name',
      query: /(foo)/,
    },
  ],
);

test(
  'matches property (correctly handles case mismatch)',
  testQuery,
  'name:foo',
  {
    name: 'Foo Bar',
  },
  [
    {
      path: 'name',
      query: /(Foo)/,
    },
  ],
);

test(
  'matches or',
  testQuery,
  'name:foo OR name:bar OR height:=180',
  {
    height: 180,
    name: 'bar',
  },
  [
    {
      path: 'name',
      query: /(bar)/,
    },
    {
      path: 'height',
    },
  ],
);

test(
  'matches star (*) wildcard',
  testQuery,
  'name:f*o',
  {
    name: 'foo bar baz',
  },
  [
    {
      path: 'name',
      query: /(foo)/,
    },
  ],
);

test(
  'matches star (*) wildcard (lazy)',
  testQuery,
  'name:f*o',
  {
    name: 'foo bar o baz',
  },
  [
    {
      path: 'name',
      query: /(foo)/,
    },
  ],
);

test(
  'matches question mark (?) wildcard',
  testQuery,
  'name:f?o',
  {
    name: 'foo bar baz',
  },
  [
    {
      path: 'name',
      query: /(foo)/,
    },
  ],
);

test(
  'matches regex',
  testQuery,
  'name:/foo/',
  {
    name: 'foo bar baz',
  },
  [
    {
      path: 'name',
      query: /(foo)/,
    },
  ],
);

test.skip(
  'matches regex (multiple)',
  testQuery,
  'name:/(foo|bar)/g',
  {
    name: 'foo bar baz',
  },
  [
    {
      path: 'name',
      query: /(foo)/,
    },
    {
      keyword: /(bar)/,
      path: 'name',
    },
  ],
);

test(
  'matches number',
  testQuery,
  'height:=180',
  {
    height: 180,
  },
  [
    {
      path: 'height',
    },
  ],
);

test(
  'matches range',
  testQuery,
  'height:[100 TO 200]',
  {
    height: 180,
  },
  [
    {
      path: 'height',
    },
  ],
);

test(
  'matches boolean',
  testQuery,
  'member:false',
  {
    member: false,
  },
  [
    {
      path: 'member',
    },
  ],
);

test(
  'matches array member',
  testQuery,
  'tags:bar',
  {
    tags: [
      'foo',
      'bar',
      'baz qux',
    ],
  },
  [
    {
      path: 'tags.1',
      query: /(bar)/,
    },
  ],
);

test(
  'matches multiple array members',
  testQuery,
  'tags:ba',
  {
    tags: [
      'foo',
      'bar',
      'baz qux',
    ],
  },
  [
    {
      path: 'tags.1',
      query: /(ba)/,
    },
    {
      path: 'tags.2',
      query: /(ba)/,
    },
  ],
);

test.skip(
  'does not include highlights from non-matching branches (and)',
  testQuery,
  'name:foo AND NOT name:foo',
  {
    name: 'foo',
  },
  [],
);

test(
  'does not include highlights from non-matching branches (or)',
  testQuery,
  'name:bar OR NOT name:foo',
  {
    name: 'foo',
  },
  [],
);

test(
  'does not highlight the same term multiple times',
  testQuery,
  'foo',
  {
    name: 'foo foo foo',
  },
  [
    {
      path: 'name',
      query: /(foo)/,
    },
  ],
);

test(
  'aggregates multiple highlights',
  testQuery,
  'foo AND bar AND baz',
  {
    name: 'foo bar baz',
  },
  [
    {
      path: 'name',
      query: /(foo|bar|baz)/,
    },
  ],
);

test(
  'aggregates multiple highlights (phrases)',
  testQuery,
  '"foo bar" AND baz',
  {
    name: 'foo bar baz',
  },
  [
    {
      path: 'name',
      query: /(foo bar|baz)/,
    },
  ],
);

test(
  'aggregates multiple highlights (escaping)',
  testQuery,
  '"(foo bar)" AND baz',
  {
    name: '(foo bar) baz',
  },
  [
    {
      path: 'name',
      query: /(\(foo bar\)|baz)/,
    },
  ],
);
