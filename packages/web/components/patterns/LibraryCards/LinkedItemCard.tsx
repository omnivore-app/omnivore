import type { LinkedItemCardProps } from './CardTypes'
import { LibraryGridCard } from './LibraryGridCard'
import { LibraryListCard } from './LibraryListCard'


// TODO: Add something for the loading view if we are loading.
export function LinkedItemCard(props: LinkedItemCardProps): JSX.Element {
  if (props.layout == 'LIST_LAYOUT') {
    return <LibraryListCard {...props} />
  } else {
    return <LibraryGridCard {...props} />
  }
}
