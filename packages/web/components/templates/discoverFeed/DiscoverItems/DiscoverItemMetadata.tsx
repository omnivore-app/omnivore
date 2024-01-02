import { HStack } from '../../../elements/LayoutPrimitives'
import { timeAgo } from '../../../patterns/LibraryCards/LibraryCardStyles'
import { DiscoverItem } from '../../../../lib/networking/queries/useGetDiscoverItems'

type DiscoverItemMetadataProps = {
  item: DiscoverItem
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
