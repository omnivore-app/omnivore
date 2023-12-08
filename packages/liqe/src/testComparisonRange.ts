import type {
  ComparisonOperator,
} from './types';

export const testComparisonRange = (query: number, value: number, operator: ComparisonOperator): boolean => {
  switch (operator) {
    case ':=': return value === query;
    case ':>': return value > query;
    case ':<': return value < query;
    case ':>=': return value >= query;
    case ':<=': return value <= query;
    default: throw new Error(`Unimplemented comparison operator: ${operator}`);
  }
};
