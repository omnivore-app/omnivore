import { LayoutType } from '../../templates/homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import type { LibraryItemNode } from '../../../lib/networking/queries/useGetLibraryItemsQuery'

export type LinkedItemCardAction =
  | 'showDetail'
  | 'showOriginal'
  | 'editTitle'
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'mark-read'
  | 'mark-unread'
  | 'set-labels'
  | 'unsubscribe'
  | 'update-item'

export type LinkedItemCardProps = {
  item: LibraryItemNode
  layout: LayoutType
  viewer: UserBasicData
  inMultiSelect: boolean
  handleAction: (action: LinkedItemCardAction) => void
}
