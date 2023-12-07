# liqe

[![Travis build status](http://img.shields.io/travis/gajus/liqe/main.svg?style=flat-square)](https://app.travis-ci.com/github/gajus/liqe)
[![Coveralls](https://img.shields.io/coveralls/gajus/liqe.svg?style=flat-square)](https://coveralls.io/github/gajus/liqe)
[![NPM version](http://img.shields.io/npm/v/liqe.svg?style=flat-square)](https://www.npmjs.org/package/liqe)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Lightweight and performant Lucene-like parser, serializer and search engine.

* [Motivation](#motivation)
* [Usage](#usage)
* [Query Syntax](#query-syntax)
  * [Liqe syntax cheat sheet](#liqe-syntax-cheat-sheet)
  * [Keyword matching](#keyword-matching)
  * [Number matching](#number-matching)
  * [Range matching](#range-matching)
  * [Wildcard matching](#wildcard-matching)
  * [Boolean operators](#boolean-operators)
* [Serializer](#serializer)
* [AST](#ast)
* [Utilities](#utilities)
* [Compatibility with Lucene](#compatibility-with-lucene)
* [Recipes](#recipes)
  * [Handling syntax errors](#handling-syntax-errors)
  * [Highlighting matches](#highlighting-matches)
* [Development](#development)
* [Tutorials](#tutorials)

## Motivation

Originally built Liqe to enable [Roarr](https://github.com/gajus/roarr) log filtering via [cli](https://github.com/gajus/roarr-cli#filtering-logs). I have since been polishing this project as a hobby/intellectual exercise. I've seen it being adopted by [various](https://github.com/gajus/liqe/network/dependents) CLI and web applications that require advanced search. To my knowledge, it is currently the most complete Lucene-like syntax parser and serializer in JavaScript, as well as a compatible in-memory search engine.

Liqe use cases include:

* parsing search queries
* serializing parsed queries
* searching JSON documents using the Liqe query language (LQL)

Note that the [Liqe AST](#ast) is treated as a public API, i.e., one could implement their own search mechanism that uses Liqe query language (LQL).

## Usage

```ts
import {
  filter,
  highlight,
  parse,
  test,
} from 'liqe';

const persons = [
  {
    height: 180,
    name: 'John Morton',
  },
  {
    height: 175,
    name: 'David Barker',
  },
  {
    height: 170,
    name: 'Thomas Castro',
  },
];
```

Filter a collection:

```ts
filter(parse('height:>170'), persons);
// [
//   {
//     height: 180,
//     name: 'John Morton',
//   },
//   {
//     height: 175,
//     name: 'David Barker',
//   },
// ]
```

Test a single object:

```ts
test(parse('name:John'), persons[0]);
// true
test(parse('name:David'), persons[0]);
// false
```

Highlight matching fields and substrings:

```ts
test(highlight('name:john'), persons[0]);
// [
//   {
//     path: 'name',
//     query: /(John)/,
//   }
// ]
test(highlight('height:180'), persons[0]);
// [
//   {
//     path: 'height',
//   }
// ]
```

## Query Syntax

Liqe uses Liqe Query Language (LQL), which is heavily inspired by Lucene but extends it in various ways that allow a more powerful search experience.

### Liqe syntax cheat sheet

```rb
# search for "foo" term anywhere in the document (case insensitive)
foo

# search for "foo" term anywhere in the document (case sensitive)
'foo'
"foo"

# search for "foo" term in `name` field
name:foo

# search for "foo" term in `full name` field
'full name':foo
"full name":foo

# search for "foo" term in `first` field, member of `name`, i.e.
# matches {name: {first: 'foo'}}
name.first:foo

# search using regex
name:/foo/
name:/foo/o

# search using wildcard
name:foo*bar
name:foo?bar

# boolean search
member:true
member:false

# null search
member:null

# search for age =, >, >=, <, <=
height:=100
height:>100
height:>=100
height:<100
height:<=100

# search for height in range (inclusive, exclusive)
height:[100 TO 200]
height:{100 TO 200}

# boolean operators
name:foo AND height:=100
name:foo OR name:bar

# unary operators
NOT foo
-foo
NOT foo:bar
-foo:bar
name:foo AND NOT (bio:bar OR bio:baz)

# implicit AND boolean operator
name:foo height:=100

# grouping
name:foo AND (bio:bar OR bio:baz)
```

### Keyword matching

Search for word "foo" in any field (case insensitive).

```rb
foo
```

Search for word "foo" in the `name` field.

```rb
name:foo
```

Search for `name` field values matching `/foo/i` regex.

```rb
name:/foo/i
```

Search for `name` field values matching `f*o` wildcard pattern.

```rb
name:f*o
```

Search for `name` field values matching `f?o` wildcard pattern.

```rb
name:f?o
```

Search for phrase "foo bar" in the `name` field (case sensitive).

```rb
name:"foo bar"
```

### Number matching

Search for value equal to 100 in the `height` field.

```rb
height:=100
```

Search for value greater than 100 in the `height` field.

```rb
height:>100
```

Search for value greater than or equal to 100 in the `height` field.

```rb
height:>=100
```

### Range matching

Search for value greater or equal to 100 and lower or equal to 200 in the `height` field.

```rb
height:[100 TO 200]
```

Search for value greater than 100 and lower than 200 in the `height` field.

```rb
height:{100 TO 200}
```

### Wildcard matching

Search for any word that starts with "foo" in the `name` field.

```rb
name:foo*
```

Search for any word that starts with "foo" and ends with "bar" in the `name` field.

```rb
name:foo*bar
```

Search for any word that starts with "foo" in the `name` field, followed by a single arbitrary character.

```rb
name:foo?
```

Search for any word that starts with "foo", followed by a single arbitrary character and immediately ends with "bar" in the `name` field.

```rb
name:foo?bar
```

### Boolean operators

Search for phrase "foo bar" in the `name` field AND the phrase "quick fox" in the `bio` field.

```rb
name:"foo bar" AND bio:"quick fox"
```

Search for either the phrase "foo bar" in the `name` field AND the phrase "quick fox" in the `bio` field, or the word "fox" in the `name` field.

```rb
(name:"foo bar" AND bio:"quick fox") OR name:fox
```

## Serializer

Serializer allows to convert Liqe tokens back to the original search query.

```ts
import {
  parse,
  serialize,
} from 'liqe';

const tokens = parse('foo:bar');

// {
//   expression: {
//     location: {
//       start: 4,
//     },
//     quoted: false,
//     type: 'LiteralExpression',
//     value: 'bar',
//   },
//   field: {
//     location: {
//       start: 0,
//     },
//     name: 'foo',
//     path: ['foo'],
//     quoted: false,
//     type: 'Field',
//   },
//   location: {
//     start: 0,
//   },
//   operator: {
//     location: {
//       start: 3,
//     },
//     operator: ':',
//     type: 'ComparisonOperator',
//   },
//   type: 'Tag',
// }

serialize(tokens);
// 'foo:bar'
```

## AST

```ts
import {
  type BooleanOperatorToken,
  type ComparisonOperatorToken,
  type EmptyExpression,
  type FieldToken,
  type ImplicitBooleanOperatorToken,
  type ImplicitFieldToken,
  type LiteralExpressionToken,
  type LogicalExpressionToken,
  type RangeExpressionToken,
  type RegexExpressionToken,
  type TagToken,
  type UnaryOperatorToken,
} from 'liqe';
```

There are 11 AST tokens that describe a parsed Liqe query.

If you are building a serializer, then you must implement all of them for the complete coverage of all possible query inputs. Refer to the [built-in serializer](./src/serialize.ts) for an example.

## Utilities

```ts
import {
  isSafeUnquotedExpression,
} from 'liqe';

/**
 * Determines if an expression requires quotes.
 * Use this if you need to programmatically manipulate the AST
 * before using a serializer to convert the query back to text.
 */
isSafeUnquotedExpression(expression: string): boolean;
```

## Compatibility with Lucene

The following Lucene abilities are not supported:

* [Fuzzy Searches](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Fuzzy%20Searches)
* [Proximity Searches](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Proximity%20Searches)
* [Boosting a Term](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Boosting%20a%20Term)

## Recipes

### Handling syntax errors

In case of a syntax error, Liqe throws `SyntaxError`.

```ts
import {
  parse,
  SyntaxError,
} from 'liqe';

try {
  parse('foo bar');
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error({
      // Syntax error at line 1 column 5
      message: error.message,
      // 4
      offset: error.offset,
      // 1
      offset: error.line,
      // 5
      offset: error.column,
    });
  } else {
    throw error;
  }
}
```

### Highlighting matches

Consider using [`highlight-words`](https://github.com/tricinel/highlight-words) package to highlight Liqe matches.

## Development

### Compiling Parser

If you are going to modify parser, then use `npm run watch` to run compiler in watch mode.

### Benchmarking Changes

Before making any changes, capture the current benchmark on your machine using `npm run benchmark`. Run benchmark again after making any changes. Before committing changes, ensure that performance is not negatively impacted.


## Tutorials

* [Building advanced SQL search from a user text input](https://contra.com/p/WobOBob7-building-advanced-sql-search-from-a-user-text-input)