export const isSafeUnquotedExpression = (expression: string): boolean => {
  return /^[#$*@A-Z_a-z][#$*.@A-Z_a-z-]*$/.test(expression);
};
