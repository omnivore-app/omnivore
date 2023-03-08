import type { LinkedItemCardProps } from './CardTypes'
import { LibraryGridCard } from './LibraryGridCard'
import { LibraryListCard } from './LibraryListCard'

export function LinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  if (props.layout == 'LIST_LAYOUT') {
    return <LibraryListCard {...props} />
  } else {
    return <LibraryGridCard {...props} />
  }
}
