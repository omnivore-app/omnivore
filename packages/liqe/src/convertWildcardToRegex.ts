const WILDCARD_RULE = /(\*+)|(\?)/g;

export const convertWildcardToRegex = (pattern: string): RegExp => {
  return new RegExp(
    pattern
      .replace(WILDCARD_RULE, (_match, p1) => {
        return p1 ? '(.+?)' : '(.)';
      }),
  );
};
