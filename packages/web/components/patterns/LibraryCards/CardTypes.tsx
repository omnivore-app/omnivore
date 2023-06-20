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
  | 'open-notebook'
  | 'unsubscribe'
  | 'update-item'

export type LinkedItemCardProps = {
  item: LibraryItemNode
  layout: LayoutType
  viewer: UserBasicData

  handleAction: (action: LinkedItemCardAction) => void

  inMultiSelect: boolean
  isChecked: boolean
  setIsChecked: (itemId: string, set: boolean) => void

  isHovered?: boolean
}
