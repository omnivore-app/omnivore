import { GridLinkedItemCard } from './GridLinkedItemCard'
import { ListLinkedItemCard } from './ListLinkedItemCard'
import type { LinkedItemCardProps } from './CardTypes'
import { HighlightItemCard } from './HighlightItemCard'
import { PageType } from '../../../lib/networking/fragments/articleFragment'
import { LibraryGridCard } from './LibraryGridCard'

const shouldHideUrl = (url: string): boolean => {
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

const siteName = (originalArticleUrl: string, itemUrl: string): string => {
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

export function LinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  const originText =
    props.item.siteName ||
    siteName(props.item.originalArticleUrl, props.item.url)

  if (props.item.pageType === PageType.HIGHLIGHTS) {
    return <HighlightItemCard {...props} />
  }
  if (props.layout == 'LIST_LAYOUT') {
    return <ListLinkedItemCard {...props} originText={originText} />
  } else {
    return <GridLinkedItemCard {...props} originText={originText} />
  }
}
