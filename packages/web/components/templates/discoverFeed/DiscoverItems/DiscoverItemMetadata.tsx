import { HStack } from '../../../elements/LayoutPrimitives'
import { timeAgo } from '../../../patterns/LibraryCards/LibraryCardStyles'
import { DiscoverFeedItem } from "../../../../lib/networking/queries/useGetDiscoverFeedItems"

type DiscoverItemMetadataProps = {
  item: DiscoverFeedItem
}

export function DiscoverItemMetadata(
  props: DiscoverItemMetadataProps
): JSX.Element {
  return (
    <HStack css={{ gap: '5px' }}>
      {timeAgo(props.item.publishedDate?.toString())}
      {` `}
    </HStack>
  )
}
