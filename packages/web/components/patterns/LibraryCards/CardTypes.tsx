import { LayoutType } from '../../templates/homeFeed/HomeFeedContainer'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import type { LibraryItemNode } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { MultiSelectMode } from '../../templates/homeFeed/LibraryHeader'

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
  | 'move-to-inbox'
  | 'refresh'

export type LinkedItemCardProps = {
  item: LibraryItemNode
  layout: LayoutType
  viewer: UserBasicData

  handleAction: (action: LinkedItemCardAction) => void

  isChecked: boolean
  setIsChecked: (itemId: string, set: boolean) => void

  multiSelectMode: MultiSelectMode

  isHovered?: boolean
  isLoading?: boolean

  legacyLayout?: boolean
}
