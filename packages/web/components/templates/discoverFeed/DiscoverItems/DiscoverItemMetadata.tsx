import { HStack } from '../../../elements/LayoutPrimitives'
import { DiscoverFeedItem } from '../../../../lib/networking/queries/useGetDiscoverFeedItems'
import { timeAgo } from '../../../../lib/textFormatting'

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
