export function cookieValue(
  cookieName: string,
  documentCookie: string
): string | undefined {
  return documentCookie
    .split('; ')
    .find((row) => row.startsWith(`${cookieName}=`))
    ?.split('=')[1]
}
