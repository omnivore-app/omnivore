const ESCAPE_RULE = /[$()*+.?[\\\]^{|}]/g;
const DASH_RULE = /-/g;

export const escapeRegexString = (subject: string): string => {
  return subject
    .replace(ESCAPE_RULE, '\\$&')
    .replace(DASH_RULE, '\\x2d');
};
