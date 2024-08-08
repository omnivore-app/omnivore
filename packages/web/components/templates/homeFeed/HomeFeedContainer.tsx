import type { LibraryItem } from '../../../lib/networking/library_items/useLibraryItems'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { MultiSelectMode } from './LibraryHeader'
import { BulkAction } from '../../../lib/networking/library_items/useLibraryItems'

export type LayoutType = 'LIST_LAYOUT' | 'GRID_LAYOUT'
export type LibraryMode = 'reads' | 'highlights' | 'tldr'

export type HomeFeedContentProps = {
  items: LibraryItem[]
  searchTerm?: string
  reloadItems: () => void
  gridContainerRef: React.RefObject<HTMLDivElement>
  applySearchQuery: (searchQuery: string) => void
  hasMore: boolean
  hasData: boolean
  totalItems: number
  isValidating: boolean
  fetchItemsError: boolean

  loadMore: () => void
  labelsTarget: LibraryItem | undefined
  setLabelsTarget: (target: LibraryItem | undefined) => void

  notebookTarget: LibraryItem | undefined
  setNotebookTarget: (target: LibraryItem | undefined) => void

  showAddLinkModal: boolean
  setShowAddLinkModal: (show: boolean) => void
  showEditTitleModal: boolean
  setShowEditTitleModal: (show: boolean) => void
  setActiveItem: (item: LibraryItem) => void

  linkToEdit: LibraryItem | undefined
  setLinkToEdit: (set: LibraryItem | undefined) => void
  linkToUnsubscribe: LibraryItem | undefined
  setLinkToUnsubscribe: (set: LibraryItem | undefined) => void

  mode: LibraryMode
  setMode: (set: LibraryMode) => void

  actionHandler: (
    action: LinkedItemCardAction,
    item: LibraryItem | undefined
  ) => Promise<void>

  handleLinkSubmission: (
    link: string,
    timezone: string,
    locale: string
  ) => Promise<void>

  setIsChecked: (itemId: string, set: boolean) => void
  itemIsChecked: (itemId: string) => boolean

  multiSelectMode: MultiSelectMode
  setMultiSelectMode: (mode: MultiSelectMode) => void

  numItemsSelected: number

  performMultiSelectAction: (action: BulkAction, labelIds?: string[]) => void
}
