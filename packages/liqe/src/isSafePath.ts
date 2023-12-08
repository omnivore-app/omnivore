const SAFE_PATH_RULE = /^(\.(?:[_a-zA-Z][a-zA-Z\d_]*|\0|[1-9]\d*))+$/u;

export const isSafePath = (path: string): boolean => {
  return SAFE_PATH_RULE.test(path);
};
