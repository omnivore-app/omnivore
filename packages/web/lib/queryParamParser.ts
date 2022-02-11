export function parseErrorCodes(
  query: Record<string, unknown>
): string | undefined {
  const errorCodesValue = query.errorCodes
  if (typeof errorCodesValue !== 'string') {
    return undefined
  }

  const errorCodes = errorCodesValue.split(',').filter((val) => val)

  return errorCodes.length ? errorCodes[0] : undefined
}
