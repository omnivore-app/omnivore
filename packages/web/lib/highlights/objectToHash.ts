import crypto from 'crypto'

/**
 * Generates uuid using MD5 hash from the specified object
 * @param obj - object to generate UUID from
 * @example
 * // returns "a3dcb4d2-29de-6fde-0db5-686dee47145d"
 * return uuidWithMd5({ foo: 'bar' }, true)
 */
export default function objectToHash(
  obj: unknown,
  convertToUUID = false
): string {
  const md5Hash = crypto
    .createHash('md5')
    .update(JSON.stringify(obj))
    .digest('hex')
  if (!convertToUUID) return md5Hash
  return (
    md5Hash.substring(0, 8) +
    '-' +
    md5Hash.substring(8, 12) +
    '-' +
    md5Hash.substring(12, 16) +
    '-' +
    md5Hash.substring(16, 20) +
    '-' +
    md5Hash.substring(20)
  ).toLowerCase()
}
