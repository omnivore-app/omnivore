import { HStack } from "../../../elements/LayoutPrimitives"
import { timeAgo } from "../../../patterns/LibraryCards/LibraryCardStyles"
import { DiscoveryItem } from "../../../../lib/networking/queries/useGetDiscoveryItems"

type DiscoveryItemMetadataProps = {
  item: DiscoveryItem
}

export function DiscoveryItemMetadata(
  props: DiscoveryItemMetadataProps
): JSX.Element {
  return (
    <HStack css={{ gap: '5px' }}>
      {timeAgo(props.item.publishedAt?.toString())}
      {` `}
    </HStack>
  )
}
