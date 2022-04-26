import { GridLinkedItemCard } from './GridLinkedItemCard'
import { ListLinkedItemCard } from './ListLinkedItemCard'
import type { LinkedItemCardProps } from './CardTypes'
import { HighlightItemCard } from './HighlightItemCard'


const siteName = (originalArticleUrl: string, itemUrl: string): string => {
  try {
    return new URL(originalArticleUrl).hostname
  } catch {}
  try {
    return new URL(itemUrl).hostname
  } catch {}
  return ''
}

export function LinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  const originText = siteName(props.item.originalArticleUrl, props.item.url)
  
  if (props.item.pageType === 'HIGHLIGHT') {
    return <HighlightItemCard {...props} />
  } else if (props.layout == 'LIST_LAYOUT') {
    return <ListLinkedItemCard {...props} originText={originText} />
  } else {
    return <GridLinkedItemCard {...props} originText={originText} />
  }
}
