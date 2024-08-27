import { Action, createAction, useKBar, useRegisterActions } from 'kbar'
import debounce from 'lodash/debounce'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TopBarProgress from 'react-topbar-progress-indicator'
import { useFetchMore } from '../../../lib/hooks/useFetchMoreScroll'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { libraryListCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import {
  SearchItem,
  TypeaheadSearchItemsData,
  typeaheadSearchQuery,
} from '../../../lib/networking/queries/typeaheadSearch'
import {
  LibraryItem,
  LibraryItemNode,
  LibraryItems,
  LibraryItemsQueryInput,
  useArchiveItem,
  useBulkActions,
  useDeleteItem,
  useGetLibraryItems,
  useMoveItemToFolder,
  useRefreshProcessingItems,
  useUpdateItemReadStatus,
} from '../../../lib/networking/library_items/useLibraryItems'
import {
  useGetViewerQuery,
  UserBasicData,
} from '../../../lib/networking/queries/useGetViewerQuery'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { LinkedItemCard } from '../../patterns/LibraryCards/LinkedItemCard'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { AddLinkModal } from '../AddLinkModal'
import { EditLibraryItemModal } from '../homeFeed/EditItemModals'
import { EmptyLibrary } from '../homeFeed/EmptyLibrary'
import { MultiSelectMode } from '../homeFeed/LibraryHeader'
import { UploadModal } from '../UploadModal'
import { BulkAction } from '../../../lib/networking/library_items/useLibraryItems'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { SetPageLabelsModalPresenter } from '../article/SetLabelsModalPresenter'
import { NotebookPresenter } from '../article/NotebookPresenter'
import { PinnedButtons } from '../homeFeed/PinnedButtons'
import { PinnedSearch } from '../../../pages/settings/pinned-searches'
import { FetchItemsError } from '../homeFeed/FetchItemsError'
import { LibraryHeader } from './LibraryHeader'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { theme } from '../../tokens/stitches.config'
import { emptyTrashMutation } from '../../../lib/networking/mutations/emptyTrashMutation'
import { State } from '../../../lib/networking/fragments/articleFragment'
import { useHandleAddUrl } from '../../../lib/hooks/useHandleAddUrl'
import { useGetViewer } from '../../../lib/networking/viewer/useGetViewer'
import { Spinner } from '@phosphor-icons/react/dist/ssr'

export type LayoutType = 'LIST_LAYOUT' | 'GRID_LAYOUT'

const fetchSearchResults = async (query: string, cb: any) => {
  if (!query.startsWith('#')) return
  const res = await typeaheadSearchQuery({
    limit: 10,
    searchQuery: query.substring(1),
  })
  cb(res)
}

const debouncedFetchSearchResults = debounce((query, cb) => {
  fetchSearchResults(query, cb)
}, 300)

type LibraryContainerProps = {
  folder: string | undefined
  filterFunc: (item: LibraryItemNode) => boolean

  showNavigationMenu: boolean
}

export function LibraryContainer(props: LibraryContainerProps): JSX.Element {
  const router = useRouter()
  const { data: viewerData } = useGetViewer()
  const { queryValue } = useKBar((state) => ({ queryValue: state.searchQuery }))
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])

  const defaultQuery = {
    limit: 10,
    folder: props.folder,
    sortDescending: true,
    searchQuery: undefined,
  }

  const gridContainerRef = useRef<HTMLDivElement>(null)

  const [labelsTarget, setLabelsTarget] =
    useState<LibraryItem | undefined>(undefined)

  const [notebookTarget, setNotebookTarget] =
    useState<LibraryItem | undefined>(undefined)

  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [showEditTitleModal, setShowEditTitleModal] = useState(false)
  const [linkToEdit, setLinkToEdit] = useState<LibraryItem>()
  const [linkToUnsubscribe, setLinkToUnsubscribe] = useState<LibraryItem>()

  const archiveItem = useArchiveItem()
  const deleteItem = useDeleteItem()
  const moveToFolder = useMoveItemToFolder()
  const bulkAction = useBulkActions()
  const updateItemReadStatus = useUpdateItemReadStatus()

  const [queryInputs, setQueryInputs] =
    useState<LibraryItemsQueryInput>(defaultQuery)

  const {
    data: itemsPages,
    isLoading,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    hasNextPage,
    error: fetchItemsError,
  } = useGetLibraryItems(props.folder ?? 'home', props.folder, queryInputs)

  useEffect(() => {
    if (queryValue.startsWith('#')) {
      debouncedFetchSearchResults(
        queryValue,
        (data: TypeaheadSearchItemsData) => {
          setSearchResults(data?.typeaheadSearch.items || [])
        }
      )
    } else setSearchResults([])
  }, [queryValue])

  useEffect(() => {
    if (!router.isReady) return
    const q = router.query['q']
    let qs = ''
    if (q && typeof q === 'string') {
      qs = q
    }

    if (qs !== (queryInputs.searchQuery || '')) {
      setQueryInputs({ ...queryInputs, searchQuery: qs })
      // performActionOnItem('refresh', undefined as unknown as any)
    }

    // intentionally not watching queryInputs and performActionOnItem
    // here to prevent infinite looping
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setQueryInputs, router.isReady, router.query])

  useEffect(() => {
    window.localStorage.setItem('nav-return', router.asPath)
  }, [router.asPath])

  const libraryItems = useMemo(() => {
    const items =
      itemsPages?.pages
        .flatMap((ad: LibraryItems) => {
          if (!ad.edges) {
            return []
          }
          return ad.edges.map((it) => ({
            ...it,
            isLoading: it.node.state === 'PROCESSING',
          }))
        })
        .filter((item) => props.filterFunc(item.node)) || []
    return items
  }, [itemsPages])

  useEffect(() => {
    if (localStorage) {
      localStorage.setItem(
        'library-slug-list',
        JSON.stringify(libraryItems.map((li) => li.node.slug))
      )
    }
  }, [libraryItems])

  const processingItems = useMemo(() => {
    return libraryItems
      .filter((li) => li.node.state === State.PROCESSING)
      .map((li) => li.node.id)
  }, [libraryItems])

  const refreshProcessingItems = useRefreshProcessingItems()

  useEffect(() => {
    if (processingItems.length) {
      refreshProcessingItems.mutateAsync({
        attempt: 0,
        itemIds: processingItems,
      })
    }
  }, [processingItems])

  const focusFirstItem = useCallback(() => {
    if (libraryItems.length < 1) {
      return
    }
    const firstItem = libraryItems[0]
    if (!firstItem) {
      return
    }
    const firstItemElement = document.getElementById(firstItem.node.id)
    if (!firstItemElement) {
      return
    }
    activateCard(firstItem.node.id)
  }, [libraryItems])

  const activateCard = useCallback(
    (id: string) => {
      if (!document.getElementById(id)) {
        return
      }
      setActiveCardId(id)
      scrollToActiveCard(id, true)

      const newItem = getItem(id)
      if (notebookTarget && newItem) {
        setNotebookTarget(newItem)
      }
    },
    [libraryItems]
  )

  const isVisible = function (ele: HTMLElement) {
    const container = window.document.documentElement
    const eleTop = ele.offsetTop
    const eleBottom = eleTop + ele.clientHeight

    const containerTop = container.scrollTop + 200
    const containerBottom = containerTop + container.clientHeight

    return eleTop >= containerTop && eleBottom <= containerBottom
  }

  const scrollToActiveCard = useCallback(
    (id: string | null, isSmouth?: boolean): void => {
      if (id) {
        const target = document.getElementById(id)
        if (target) {
          try {
            if (!isVisible(target)) {
              target.scrollIntoView({
                block: 'center',
                behavior: isSmouth ? 'smooth' : 'auto',
              })
            }
            target.focus({
              preventScroll: true,
            })
          } catch (error) {
            console.log('Cannot Scroll', error)
          }
        }
      }
    },
    []
  )

  const alreadyScrolled = useRef<boolean>(false)
  const [activeCardId, setActiveCardId] = usePersistedState<string | null>({
    key: `--library-active-card-id`,
    initialValue: null,
    isSessionStorage: true,
  })

  const activeItem = useMemo(() => {
    if (!activeCardId) {
      return undefined
    }

    return libraryItems.find((item) => item.node.id === activeCardId)
  }, [libraryItems, activeCardId])

  const getItem = useCallback(
    (itemId: string) => {
      return libraryItems.find((item) => item.node.id === itemId)
    },
    [libraryItems]
  )

  const activeItemIndex = useMemo(() => {
    if (!activeCardId) {
      return undefined
    }

    const result = libraryItems.findIndex(
      (item) => item.node.id === activeCardId
    )
    return result >= 0 ? result : undefined
  }, [libraryItems, activeCardId])

  useEffect(() => {
    console.log('active card id: ', activeCardId)
    if (activeCardId && !alreadyScrolled.current) {
      scrollToActiveCard(activeCardId)
      alreadyScrolled.current = true
    }
  }, [activeCardId, scrollToActiveCard])

  const handleCardAction = async (
    action: LinkedItemCardAction,
    item: LibraryItem | undefined
  ): Promise<void> => {
    if (!item) {
      return
    }

    switch (action) {
      case 'showDetail':
        const username = viewerData?.profile.username
        if (username) {
          setActiveCardId(item.node.id)
          if (item.node.state === State.PROCESSING) {
            router.push(`/article?url=${encodeURIComponent(item.node.url)}`)
          } else {
            router.push(`/${username}/${item.node.slug}`)
          }
        }
        break
      case 'showOriginal':
        const url = item.node.originalArticleUrl
        if (url) {
          window.open(url, '_blank')
        }
        break
      case 'archive':
      case 'unarchive':
        try {
          await archiveItem.mutateAsync({
            itemId: item.node.id,
            slug: item.node.slug,
            input: {
              linkId: item.node.id,
              archived: action == 'archive',
            },
          })
        } catch (err) {
          console.log('Error setting archive state: ', err)
          showErrorToast(`Error ${action}ing item`, {
            position: 'bottom-right',
          })
          return
        }
        showSuccessToast(`Item ${action}d`, {
          position: 'bottom-right',
        })
        break
      case 'delete':
        try {
          await deleteItem.mutateAsync({
            itemId: item.node.id,
            slug: item.node.slug,
          })
        } catch (err) {
          console.log('Error deleting item: ', err)
          showErrorToast(`Error deleting item`, {
            position: 'bottom-right',
          })
          return
        }

        showSuccessToast(`Item deleted`, {
          position: 'bottom-right',
        })
        break
      case 'mark-read':
      case 'mark-unread':
        const desc = action == 'mark-read' ? 'read' : 'unread'
        const values =
          action == 'mark-read'
            ? {
                readingProgressPercent: 100,
                readingProgressTopPercent: 100,
                readingProgressAnchorIndex: 0,
              }
            : {
                readingProgressPercent: 0,
                readingProgressTopPercent: 0,
                readingProgressAnchorIndex: 0,
              }
        try {
          await updateItemReadStatus.mutateAsync({
            itemId: item.node.id,
            slug: item.node.slug,
            input: {
              id: item.node.id,
              force: true,
              ...values,
            },
          })
        } catch (err) {
          console.log('Error marking item: ', err)
          showErrorToast(`Error marking as ${desc}`, {
            position: 'bottom-right',
          })
          return
        }
        break
      case 'move-to-inbox':
        try {
          await moveToFolder.mutateAsync({
            itemId: item.node.id,
            slug: item.node.slug,
            folder: 'inbox',
          })
        } catch (err) {
          console.log('Error moving item: ', err)
          showErrorToast(`Error moving item`, {
            position: 'bottom-right',
          })
          return
        }
        showSuccessToast(`Item moved to library`, {
          position: 'bottom-right',
        })
        break
      case 'set-labels':
        setLabelsTarget(item)
        break
      case 'open-notebook':
        if (!notebookTarget) {
          setNotebookTarget(item)
        } else {
          setNotebookTarget(undefined)
        }
        break
      case 'unsubscribe':
        // setLinkToUnsubscribe(item.node)
        break
      default:
        console.warn('unknown action: ', action)
    }
  }

  const modalTargetItem = useMemo(() => {
    return labelsTarget || linkToEdit || linkToUnsubscribe
  }, [labelsTarget, linkToEdit, linkToUnsubscribe])

  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [multiSelectMode, setMultiSelectMode] = useState<MultiSelectMode>('off')

  const selectActiveArticle = useCallback(() => {
    if (activeItem) {
      if (multiSelectMode === 'off') {
        setMultiSelectMode('some')
      }
      const itemId = activeItem.node.id
      const isChecked = itemIsChecked(itemId)
      setIsChecked(itemId, !isChecked)
    }
  }, [activeItem, multiSelectMode, checkedItems])

  useKeyboardShortcuts(
    libraryListCommands((action) => {
      const columnCount = (container: HTMLDivElement) => {
        const gridComputedStyle = window.getComputedStyle(container)
        const gridColumnCount = gridComputedStyle
          .getPropertyValue('grid-template-columns')
          .split(' ').length
        return gridColumnCount
      }

      // If any of the modals are open we disable handling keyboard shortcuts
      if (modalTargetItem) {
        return
      }

      switch (action) {
        case 'openArticle':
          if (multiSelectMode !== 'off' && activeItem) {
            const itemId = activeItem.node.id
            const isChecked = itemIsChecked(itemId)
            setIsChecked(itemId, !isChecked)
          } else {
            handleCardAction('showDetail', activeItem)
          }
          break
        case 'selectArticle':
          selectActiveArticle()
          break
        case 'openOriginalArticle':
          handleCardAction('showOriginal', activeItem)
          break
        case 'showAddLinkModal':
          setTimeout(() => setShowAddLinkModal(true), 0)
          break
        case 'moveFocusToNextListItem': {
          const currentItemIndex = activeItemIndex
          const nextItemIndex =
            currentItemIndex == undefined ? 0 : currentItemIndex + 1
          const nextItem = libraryItems[nextItemIndex]
          if (nextItem) {
            activateCard(nextItem.node.id)
          }
          break
        }
        case 'moveFocusToPreviousListItem': {
          const currentItemIndex = activeItemIndex
          const previousItemIndex =
            currentItemIndex == undefined ? 0 : currentItemIndex - 1
          const previousItem = libraryItems[previousItemIndex]
          if (previousItem) {
            activateCard(previousItem.node.id)
          }
          break
        }
        case 'moveFocusToNextRowItem': {
          const selectedItemIndex = activeItemIndex
          if (selectedItemIndex !== undefined && gridContainerRef?.current) {
            const nextItemIndex = Math.min(
              selectedItemIndex + columnCount(gridContainerRef.current),
              libraryItems.length - 1
            )
            const nextItem = libraryItems[nextItemIndex]
            if (nextItem) {
              const nextItemElement = document.getElementById(nextItem.node.id)
              if (nextItemElement) {
                activateCard(nextItem.node.id)
              }
            }
          } else {
            focusFirstItem()
          }
          break
        }
        case 'moveFocusToPreviousRowItem': {
          const selectedItemIndex = activeItemIndex
          if (selectedItemIndex !== undefined && gridContainerRef?.current) {
            const nextItemIndex = Math.max(
              0,
              selectedItemIndex - columnCount(gridContainerRef.current)
            )
            const nextItem = libraryItems[nextItemIndex]
            if (nextItem) {
              const nextItemElement = document.getElementById(nextItem.node.id)
              if (nextItemElement) {
                activateCard(nextItem.node.id)
              }
            }
          } else {
            focusFirstItem()
          }
          break
        }
        case 'archiveItem':
          handleCardAction('archive', activeItem)
          break
        case 'removeItem':
          handleCardAction('delete', activeItem)
          break
        case 'markItemAsRead':
          handleCardAction('mark-read', activeItem)
          break
        case 'markItemAsUnread':
          handleCardAction('mark-unread', activeItem)
          break
        case 'showEditLabelsModal':
          handleCardAction('set-labels', activeItem)
          break
        case 'openNotebook':
          handleCardAction('open-notebook', activeItem)
          break
        case 'sortDescending':
          setQueryInputs({ ...queryInputs, sortDescending: true })
          break
        case 'sortAscending':
          setQueryInputs({ ...queryInputs, sortDescending: false })
          break
        case 'beginMultiSelect':
          if (multiSelectMode == 'off') {
            setMultiSelectMode('none')
          }
          break
        case 'endMultiSelect':
          setMultiSelectMode('off')
          break
      }
    })
  )

  const ARCHIVE_ACTION =
    activeItem?.node.state !== State.ARCHIVED
      ? createAction({
          section: 'Library',
          name: 'Archive selected item',
          shortcut: ['e'],
          perform: () => handleCardAction('archive', activeItem),
        })
      : createAction({
          section: 'Library',
          name: 'UnArchive selected item',
          shortcut: ['e'],
          perform: () => handleCardAction('unarchive', activeItem),
        })

  const ACTIVE_ACTIONS = [
    ARCHIVE_ACTION,
    createAction({
      section: 'Library',
      name: 'Remove item',
      shortcut: ['#'],
      perform: () => handleCardAction('delete', activeItem),
    }),
    createAction({
      section: 'Library',
      name: 'Edit item labels',
      shortcut: ['l'],
      perform: () => handleCardAction('set-labels', activeItem),
    }),
    createAction({
      section: 'Library',
      name: 'Open Notebook',
      shortcut: ['t'],
      perform: () => handleCardAction('open-notebook', activeItem),
    }),
    createAction({
      section: 'Library',
      name: 'Mark item as read',
      shortcut: ['-'],
      perform: () => {
        handleCardAction('mark-read', activeItem)
      },
    }),
    createAction({
      section: 'Library',
      name: 'Mark item as unread',
      shortcut: ['_'],
      perform: () => handleCardAction('mark-unread', activeItem),
    }),
  ]

  const UNACTIVE_ACTIONS: Action[] = [
    // createAction({
    //   section: 'Library',
    //   name: 'Sort in ascending order',
    //   shortcut: ['s', 'o'],
    //   perform: () => setQueryInputs({ ...queryInputs, sortDescending: false }),
    // }),
    // createAction({
    //   section: 'Library',
    //   name: 'Sort in descending order',
    //   shortcut: ['s', 'n'],
    //   perform: () => setQueryInputs({ ...queryInputs, sortDescending: true }),
    // }),
  ]

  useRegisterActions(
    searchResults.map((link) => ({
      id: link.id,
      section: 'Search Results',
      name: link.title,
      keywords: '#' + link.title + ' #' + link.siteName,
      perform: () => {
        const username = viewerData?.profile.username
        if (username) {
          setActiveCardId(link.id)
          router.push(`/${username}/${link.slug}`)
        }
      },
    })),
    [searchResults]
  )

  useRegisterActions(
    activeCardId ? [...ACTIVE_ACTIONS, ...UNACTIVE_ACTIONS] : UNACTIVE_ACTIONS,
    [activeCardId, activeItem]
  )
  useFetchMore(() => {
    if (!isFetching && !isLoading && hasNextPage) {
      fetchNextPage()
    }
  })

  const setIsChecked = useCallback(
    (itemId: string, set: boolean) => {
      if (set && checkedItems.indexOf(itemId) === -1) {
        checkedItems.push(itemId)
        setCheckedItems([...checkedItems])
      } else if (!set && checkedItems.indexOf(itemId) !== -1) {
        checkedItems.splice(checkedItems.indexOf(itemId), 1)
        setCheckedItems([...checkedItems])
      }

      if (set && multiSelectMode == 'off') {
        setMultiSelectMode('some')
      }

      if (checkedItems.length < 1) {
        setMultiSelectMode('off')
      }
    },
    [checkedItems, multiSelectMode, setMultiSelectMode]
  )

  useEffect(() => {
    switch (multiSelectMode) {
      case 'off':
      case 'none':
        setCheckedItems([])
        break
      case 'some':
        break
      case 'search':
      case 'visible':
        const allIds = (
          itemsPages?.pages.flatMap((ad) => {
            return ad.edges
          }) || []
        ).map((item) => item.node.id)
        setCheckedItems(allIds)
        break
    }
  }, [multiSelectMode])

  const itemIsChecked = useCallback(
    (itemId: string) => {
      return checkedItems.indexOf(itemId) !== -1
    },
    [checkedItems]
  )

  const performMultiSelectAction = useCallback(
    (action: BulkAction, labelIds?: string[]) => {
      if (multiSelectMode === 'off') {
        return
      }
      if (multiSelectMode !== 'search' && checkedItems.length < 1) {
        return
      }
      ;(async () => {
        const query =
          multiSelectMode === 'search'
            ? queryInputs.searchQuery || 'in:inbox'
            : `includes:${checkedItems.join(',')}`
        const expectedCount = checkedItems.length

        let bulkArguments = undefined
        if (action == BulkAction.MOVE_TO_FOLDER) {
          bulkArguments = { folder: 'inbox ' }
        }

        try {
          const res = await bulkAction.mutateAsync({
            action,
            query,
            expectedCount,
            labelIds,
            arguments: bulkArguments,
          })
          if (res) {
            let successMessage: string | undefined = undefined
            switch (action) {
              case BulkAction.ARCHIVE:
                successMessage = 'Link Archived'
                break
              case BulkAction.ADD_LABELS:
                successMessage = 'Labels Added'
                break
              case BulkAction.DELETE:
                successMessage = 'Items deleted'
                break
              case BulkAction.MARK_AS_READ:
                successMessage = 'Items marked as read'
                break
              case BulkAction.MOVE_TO_FOLDER:
                successMessage = 'Items moved to library'
                break
            }
            if (successMessage) {
              showSuccessToast(successMessage, { position: 'bottom-right' })
            }
          } else {
            showErrorToast('Error performing bulk action', {
              position: 'bottom-right',
            })
          }
        } catch (err) {
          showErrorToast('Error performing bulk action', {
            position: 'bottom-right',
          })
        }
        // mutate()
      })()
      setMultiSelectMode('off')
    },
    [itemsPages, multiSelectMode, checkedItems]
  )

  return (
    <HomeFeedGrid
      folder={props.folder}
      items={libraryItems}
      actionHandler={handleCardAction}
      setIsChecked={setIsChecked}
      itemIsChecked={itemIsChecked}
      multiSelectMode={multiSelectMode}
      showNavigationMenu={props.showNavigationMenu}
      setMultiSelectMode={setMultiSelectMode}
      performMultiSelectAction={performMultiSelectAction}
      searchTerm={queryInputs.searchQuery}
      gridContainerRef={gridContainerRef}
      applySearchQuery={(searchQuery: string) => {
        setQueryInputs({
          ...queryInputs,
          searchQuery,
        })
        const qp = new URLSearchParams(window.location.search)
        if (searchQuery) {
          qp.set('q', searchQuery)
        } else {
          qp.delete('q')
        }

        const href = `${window.location.pathname}?${qp.toString()}`
        router.push(href, href, { shallow: true })
        window.sessionStorage.setItem('q', qp.toString())
      }}
      loadMore={fetchNextPage}
      hasMore={hasNextPage ?? false}
      hasData={!!itemsPages}
      isValidating={isLoading || isFetching || isFetchingNextPage}
      fetchItemsError={!!fetchItemsError}
      labelsTarget={labelsTarget}
      setLabelsTarget={setLabelsTarget}
      notebookTarget={notebookTarget}
      setNotebookTarget={setNotebookTarget}
      showAddLinkModal={showAddLinkModal}
      setShowAddLinkModal={setShowAddLinkModal}
      showEditTitleModal={showEditTitleModal}
      setShowEditTitleModal={setShowEditTitleModal}
      setActiveItem={(item: LibraryItem) => {
        activateCard(item.node.id)
      }}
      linkToEdit={linkToEdit}
      setLinkToEdit={setLinkToEdit}
      linkToUnsubscribe={linkToUnsubscribe}
      setLinkToUnsubscribe={setLinkToUnsubscribe}
      numItemsSelected={checkedItems.length}
    />
  )
}

export type HomeFeedContentProps = {
  folder: string | undefined
  items: LibraryItem[]
  searchTerm?: string
  gridContainerRef: React.RefObject<HTMLDivElement>
  applySearchQuery: (searchQuery: string) => void
  hasMore: boolean
  hasData: boolean
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

  actionHandler: (
    action: LinkedItemCardAction,
    item: LibraryItem | undefined
  ) => Promise<void>

  showNavigationMenu: boolean

  setIsChecked: (itemId: string, set: boolean) => void
  itemIsChecked: (itemId: string) => boolean

  multiSelectMode: MultiSelectMode
  setMultiSelectMode: (mode: MultiSelectMode) => void

  numItemsSelected: number

  performMultiSelectAction: (action: BulkAction, labelIds?: string[]) => void
}

function HomeFeedGrid(props: HomeFeedContentProps): JSX.Element {
  const { data: viewerData } = useGetViewer()
  const [layout, setLayout] = usePersistedState<LayoutType>({
    key: 'libraryLayout',
    initialValue: 'LIST_LAYOUT',
  })

  const updateLayout = useCallback(
    async (newLayout: LayoutType) => {
      if (layout === newLayout) return
      setLayout(newLayout)
    },
    [layout, setLayout]
  )

  const showItems = useMemo(() => {
    if (props.fetchItemsError) {
      return false
    }
    if (!props.isValidating && props.items.length <= 0) {
      return false
    }
    return true
  }, [props])

  const addUrl = useHandleAddUrl()

  return (
    <VStack
      css={{
        height: '100%',
        px: '20px',
        py: '20px',
        width: '100%',
        '@mdDown': {
          px: '0px',
        },
      }}
      distribution="start"
      alignment="start"
    >
      <LibraryHeader
        layout={layout}
        folder={props.folder}
        viewer={viewerData}
        updateLayout={updateLayout}
        showFilterMenu={props.showNavigationMenu}
        searchTerm={props.searchTerm}
        applySearchQuery={(searchQuery: string) => {
          props.applySearchQuery(searchQuery)
        }}
        multiSelectMode={props.multiSelectMode}
        setMultiSelectMode={props.setMultiSelectMode}
        numItemsSelected={props.numItemsSelected}
        performMultiSelectAction={props.performMultiSelectAction}
      />

      <HStack css={{ width: '100%', height: '100%' }}>
        {!showItems && props.fetchItemsError && <FetchItemsError />}
        {!showItems && !props.fetchItemsError && props.items.length <= 0 && (
          <EmptyLibrary
            folder={props.folder ?? 'home'}
            onAddLinkClicked={() => {
              props.setShowAddLinkModal(true)
            }}
          />
        )}

        {showItems && (
          <LibraryItemsLayout
            viewer={viewerData}
            layout={layout}
            isChecked={props.itemIsChecked}
            {...props}
          />
        )}

        {props.showAddLinkModal && (
          <AddLinkModal
            handleLinkSubmission={addUrl}
            onOpenChange={() => props.setShowAddLinkModal(false)}
          />
        )}
      </HStack>
    </VStack>
  )
}

type LibraryItemsLayoutProps = {
  folder: string | undefined

  layout: LayoutType
  viewer?: UserBasicData

  multiSelectMode: MultiSelectMode
  setMultiSelectMode: (mode: MultiSelectMode) => void

  isChecked: (itemId: string) => boolean
  setIsChecked: (itemId: string, set: boolean) => void
} & HomeFeedContentProps

export function LibraryItemsLayout(
  props: LibraryItemsLayoutProps
): JSX.Element {
  const [showUnsubscribeConfirmation, setShowUnsubscribeConfirmation] =
    useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const unsubscribe = () => {
    if (!props.linkToUnsubscribe) {
      return
    }
    props.actionHandler('unsubscribe', props.linkToUnsubscribe)
    props.setLinkToUnsubscribe(undefined)
    setShowUnsubscribeConfirmation(false)
  }

  const [pinnedSearches, setPinnedSearches] = usePersistedState<
    PinnedSearch[] | null
  >({
    key: `--library-pinned-searches`,
    initialValue: [],
    isSessionStorage: false,
  })

  return (
    <>
      <VStack
        alignment="start"
        distribution="start"
        css={{
          height: '100%',
          width: '100%',
          paddingX: '40px',
          '@mdDown': {
            mx: props.layout == 'GRID_LAYOUT' ? '20px' : '0px',
          },
        }}
      >
        <SpanBox
          css={{
            alignSelf: 'flex-start',
            '-ms-overflow-style': 'none',
            scrollbarWidth: 'none',
            '::-webkit-scrollbar': {
              display: 'none',
            },
            '@lgDown': {
              display: 'none',
            },
            mt: '10px',
            mb: '10px',
            px: '70px',
            '@xlgDown': {
              px: '0px',
            },
          }}
        >
          <PinnedButtons
            multiSelectMode={props.multiSelectMode}
            layout={props.layout}
            items={pinnedSearches ?? []}
            searchTerm={props.searchTerm}
            applySearchQuery={props.applySearchQuery}
          />
        </SpanBox>

        {props.folder == 'trash' && (
          <VStack
            css={{
              alignSelf: 'flex-start',
              '-ms-overflow-style': 'none',
              scrollbarWidth: 'none',
              '::-webkit-scrollbar': {
                display: 'none',
              },
              '@lgDown': {
                display: 'none',
              },
              fontSize: '13px',
              color: '$readerTextSubtle',
              mt: '10px',
              mb: '10px',
              px: '70px',
              '@xlgDown': {
                px: '0px',
              },
            }}
            distribution="start"
          >
            <HStack
              alignment="center"
              distribution="start"
              css={{ gap: '10px' }}
            >
              <SpanBox css={{ pt: '4px' }}>
                <TrashIcon
                  size={18}
                  color={theme.colors.thNotebookSubtle.toString()}
                />
              </SpanBox>
              <VStack>
                Items that remain in your trash for 14 days will be permanently
                deleted.
                <Button
                  style="link"
                  css={{ textDecoration: 'underline' }}
                  onClick={async (event) => {
                    event.preventDefault()
                    alert(
                      'Emptying trash happens in the background and could take a few minutes depending on the number of items you have in the trash. You may see old items in your trash during this time.'
                    )
                    await emptyTrashMutation()
                    showSuccessToast('Emptying trash')
                    setTimeout(() => {
                      props.actionHandler('refresh', undefined)
                    }, 500)
                  }}
                >
                  Empty trash now
                </Button>
              </VStack>
            </HStack>
            <hr />
          </VStack>
        )}

        {props.isValidating && <TopBarProgress />}
        <div
          onDragEnter={(event) => {
            if (
              event.dataTransfer.types.find((t) => t.toLowerCase() == 'files')
            ) {
              setShowUploadModal(true)
            }
          }}
          style={{ height: '100%', width: '100%' }}
        >
          <LibraryItemsList
            folder={props.folder}
            items={props.items}
            layout={props.layout}
            viewer={props.viewer}
            isChecked={props.isChecked}
            setIsChecked={props.setIsChecked}
            gridContainerRef={props.gridContainerRef}
            setShowEditTitleModal={props.setShowEditTitleModal}
            setLinkToEdit={props.setLinkToEdit}
            setShowUnsubscribeConfirmation={setShowUnsubscribeConfirmation}
            setLinkToUnsubscribe={props.setLinkToUnsubscribe}
            actionHandler={props.actionHandler}
            multiSelectMode={props.multiSelectMode}
          />
          <HStack
            distribution="center"
            css={{ width: '100%', mt: '$2', mb: '$4' }}
          >
            {props.hasMore ? (
              props.isValidating ? (
                <Spinner />
              ) : (
                <Button
                  style="ctaGray"
                  css={{
                    cursor: props.isValidating ? 'not-allowed' : 'pointer',
                  }}
                  onClick={props.loadMore}
                  disabled={props.isValidating}
                >
                  {props.isValidating ? 'Loading' : 'More search results'}
                </Button>
              )
            ) : (
              <StyledText style="caption"></StyledText>
            )}
          </HStack>
        </div>
      </VStack>
      {props.showEditTitleModal && (
        <EditLibraryItemModal
          onOpenChange={() => {
            props.setShowEditTitleModal(false)
            props.setLinkToEdit(undefined)
          }}
          updateItem={async () => {
            await Promise.resolve()
            console.log('item updated')
          }}
          item={props.linkToEdit as LibraryItem}
        />
      )}
      {showUnsubscribeConfirmation && (
        <ConfirmationModal
          message={'Are you sure you want to unsubscribe?'}
          onAccept={unsubscribe}
          onOpenChange={() => setShowUnsubscribeConfirmation(false)}
        />
      )}
      {props.labelsTarget?.node.id && (
        <SetPageLabelsModalPresenter
          libraryItem={props.labelsTarget.node}
          onOpenChange={() => {
            if (props.labelsTarget) {
              const activate = props.labelsTarget
              props.setActiveItem(activate)
              props.setLabelsTarget(undefined)
            }
          }}
        />
      )}
      {props.viewer && props.notebookTarget?.node.id && (
        <NotebookPresenter
          viewer={props.viewer}
          item={props.notebookTarget?.node}
          open={props.notebookTarget?.node !== undefined}
          setOpen={(open: boolean) => {
            // onClose={(highlights: Highlight[]) => {
            //   if (props.notebookTarget?.node.highlights) {
            //     props.notebookTarget.node.highlights = highlights
            //   }
            props.setNotebookTarget(open ? props.notebookTarget : undefined)
          }}
        />
      )}
      {showUploadModal && (
        <UploadModal onOpenChange={() => setShowUploadModal(false)} />
      )}
    </>
  )
}

type LibraryItemsProps = {
  folder: string | undefined
  items: LibraryItem[]
  layout: LayoutType
  viewer: UserBasicData | undefined

  gridContainerRef: React.RefObject<HTMLDivElement>

  setShowEditTitleModal: (show: boolean) => void
  setLinkToEdit: (set: LibraryItem | undefined) => void
  setShowUnsubscribeConfirmation: (show: true) => void
  setLinkToUnsubscribe: (set: LibraryItem | undefined) => void

  isChecked: (itemId: string) => boolean
  setIsChecked: (itemId: string, set: boolean) => void
  multiSelectMode: MultiSelectMode

  actionHandler: (
    action: LinkedItemCardAction,
    item: LibraryItem | undefined
  ) => Promise<void>
}

function LibraryItemsList(props: LibraryItemsProps): JSX.Element {
  return (
    <Box
      ref={props.gridContainerRef}
      css={{
        display: 'grid',
        width: '100%',
        gridAutoRows: 'auto',
        borderRadius: '6px',
        gridGap: props.layout == 'LIST_LAYOUT' ? '0px' : '20px',
        marginTop: '10px',
        marginBottom: '0px',
        paddingTop: '0',
        paddingBottom: '0px',
        overflow: 'visible',
        px: '70px',
        '@xlgDown': {
          px: '0px',
        },
        '@mdDown': {
          px: '0px',
          gap: '0px',
        },
        gridTemplateColumns:
          props.layout == 'LIST_LAYOUT'
            ? 'none'
            : `repeat( auto-fit, minmax(280px, 1fr) )`,
      }}
    >
      {props.items.map((linkedItem) => (
        <Box
          className="linkedItemCard"
          data-testid="linkedItemCard"
          id={linkedItem.node.id}
          tabIndex={0}
          key={linkedItem.node.id + linkedItem.node.image}
          css={{
            width: '100%',
            '&:focus-visible': {
              outline: 'none',
            },
            '&> div': {
              // bg: '$thLeftMenuBackground',
              // bg: '$thLibraryBackground',
            },
            '&:focus': {
              outline: 'none',
              '> div': {
                outline: 'none',
                bg: '$thBackgroundActive',
              },
            },
            '&:hover': {
              '> div': {
                bg: '$thBackgroundActive',
                boxShadow: '$cardBoxShadow',
              },
              '> a': {
                bg: '$thBackgroundActive',
              },
            },
          }}
        >
          {props.viewer && (
            <LinkedItemCard
              layout={props.layout}
              item={linkedItem.node}
              isLoading={linkedItem.isLoading}
              viewer={props.viewer}
              isChecked={props.isChecked(linkedItem.node.id)}
              setIsChecked={props.setIsChecked}
              multiSelectMode={props.multiSelectMode}
              handleAction={(action: LinkedItemCardAction) => {
                if (action === 'editTitle') {
                  props.setShowEditTitleModal(true)
                  props.setLinkToEdit(linkedItem)
                } else if (action == 'unsubscribe') {
                  props.setShowUnsubscribeConfirmation(true)
                  props.setLinkToUnsubscribe(linkedItem)
                } else {
                  props.actionHandler(action, linkedItem)
                }
                document.body.style.removeProperty('pointer-events')
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  )
}
