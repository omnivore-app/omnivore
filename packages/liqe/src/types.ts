export type Range = {
  max: number,
  maxInclusive: boolean,
  min: number,
  minInclusive: boolean,
};

export type ComparisonOperator = ':' | ':<' | ':<=' | ':=' | ':>' | ':>=';

export type ComparisonOperatorToken = {
  location: TokenLocation,
  operator: ComparisonOperator,
  type: 'ComparisonOperator',
};

export type ImplicitFieldToken = {
  type: 'ImplicitField',
};

export type FieldToken = {
  location: TokenLocation,
  name: string,
  path?: readonly string[],
  type: 'Field',
} & (
  {
    quoted: false,
  } | {
    quoted: true,
    quotes: 'double' | 'single',
  }
);

export type RegexExpressionToken = {
  location: TokenLocation,
  type: 'RegexExpression',
  value: string,
};

export type RangeExpressionToken = {
  location: TokenLocation,
  range: Range,
  type: 'RangeExpression',
};

export type LiteralExpressionToken = {
  location: TokenLocation,
  type: 'LiteralExpression',
} & (
  {
    quoted: false,
    value: boolean | string | null,
  } | {
    quoted: true,
    quotes: 'double' | 'single',
    value: string,
  }
);

export type EmptyExpression = {
  location: TokenLocation,
  type: 'EmptyExpression',
};

export type ExpressionToken = EmptyExpression | LiteralExpressionToken | RangeExpressionToken | RegexExpressionToken;

export type BooleanOperatorToken = {
  location: TokenLocation,
  operator: 'AND' | 'OR',
  type: 'BooleanOperator',
};

// Implicit boolean operators do not have a location, e.g., "foo bar".
// In this example, the implicit AND operator is the space between "foo" and "bar".
export type ImplicitBooleanOperatorToken = {
  operator: 'AND',
  type: 'ImplicitBooleanOperator',
};

export type TokenLocation = {
  end: number,
  start: number,
};

export type TagToken = {
  expression: ExpressionToken,
  field: FieldToken | ImplicitFieldToken,
  location: TokenLocation,
  operator: ComparisonOperatorToken,
  test?: InternalTest,
  type: 'Tag',
};

export type LogicalExpressionToken = {
  left: ParserAst,
  location: TokenLocation,
  operator: BooleanOperatorToken | ImplicitBooleanOperatorToken,
  right: ParserAst,
  type: 'LogicalExpression',
};

export type UnaryOperatorToken = {
  location: TokenLocation,
  operand: ParserAst,
  operator: '-' | 'NOT',
  type: 'UnaryOperator',
};

export type ParenthesizedExpressionToken = {
  expression: ParserAst,
  location: TokenLocation,
  type: 'ParenthesizedExpression',
};

export type ParserAst = EmptyExpression | LogicalExpressionToken | ParenthesizedExpressionToken | TagToken | UnaryOperatorToken;

export type LiqeQuery = ParserAst & {
  getValue?: (subject: unknown) => unknown,
  left?: LiqeQuery,
  operand?: LiqeQuery,
  right?: LiqeQuery,
};

export type InternalHighlight = {
  keyword?: string,
  path: string,
};

export type Highlight = {
  path: string,
  query?: RegExp,
};

export type InternalTest = (value: unknown) => boolean | string;
