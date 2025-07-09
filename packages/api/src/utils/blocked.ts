// import normalizeUrl from 'normalize-url'

const BLOCKED_SITES = [
  'https://mail.google.com/',
  'https://accounts.google.com/',
  'https://dev.omnivore.app',
  'https://demo.omnivore.app',
  'https://omnivore.app',
]

export const isSiteBlockedForParse = (urlToParse: string): boolean => {
  let isBlocked = false
  const host = getHost(urlToParse)

  for (const site of BLOCKED_SITES) {
    const blockedHost = getHost(site)

    isBlocked = host === blockedHost
    if (isBlocked) break
  }

  return isBlocked
}

const getHost = (url: string): string => {
  const normalizedUrl =
    url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `http://${url}`
  return new URL(normalizedUrl).host.replace(/^www\./, '')
}
