import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const timeAgo = (date: string | undefined): string => {
  if (!date) {
    return ''
  }
  return dayjs(date).fromNow()
}

export const shouldHideUrl = (url: string): boolean => {
  try {
    const origin = new URL(url).origin
    const hideHosts = ['https://storage.googleapis.com', 'https://omnivore.app']
    if (hideHosts.indexOf(origin) != -1) {
      return true
    }
  } catch {
    console.log('invalid url item', url)
  }
  return false
}

const shouldHideSiteName = (siteName: string) => {
  const hideNames = ['storage.googleapis.com', 'omnivore.app']
  if (hideNames.indexOf(siteName) != -1) {
    return true
  }
  return false
}

export const siteName = (
  originalArticleUrl: string,
  itemUrl: string,
  siteName?: string
): string => {
  if (siteName) {
    return shouldHideSiteName(siteName) ? '' : siteName
  }
  if (shouldHideUrl(originalArticleUrl)) {
    return ''
  }
  try {
    return new URL(originalArticleUrl).hostname.replace(/^www\./, '')
  } catch {}
  try {
    return new URL(itemUrl).hostname.replace(/^www\./, '')
  } catch {}
  return ''
}
