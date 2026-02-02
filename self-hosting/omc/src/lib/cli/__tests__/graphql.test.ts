import { describe, expect, it } from 'vitest';
import { checkGraphQLResult } from '../graphql.js';

describe('checkGraphQLResult', () => {
  it('throws on GraphQL-level errors', () => {
    expect(() => checkGraphQLResult({ errors: [{ message: 'Boom' }] })).toThrow(/GraphQL errors: Boom/);
  });

  it('throws on domain-level errorCodes under data', () => {
    expect(() => checkGraphQLResult({ data: { article: { errorCodes: ['NOT_FOUND'] } } })).toThrow(/article error: NOT_FOUND/);
  });

  it('does not throw when there are no errors', () => {
    expect(() => checkGraphQLResult({ data: { updatePage: { updatedPage: { id: '1' } } } })).not.toThrow();
  });
});

