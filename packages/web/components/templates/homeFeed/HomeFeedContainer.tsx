import { Action, createAction, useKBar, useRegisterActions } from 'kbar'
import debounce from 'lodash/debounce'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import TopBarProgress from 'react-topbar-progress-indicator'
import { useFetchMore } from '../../../lib/hooks/useFetchMoreScroll'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { libraryListCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import {
  PageType,
  State,
} from '../../../lib/networking/fragments/articleFragment'
import {
  SearchItem,
  TypeaheadSearchItemsData,
  typeaheadSearchQuery,
} from '../../../lib/networking/queries/typeaheadSearch'
import type {
  LibraryItem,
  LibraryItemsQueryInput,
} from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { useGetLibraryItemsQuery } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import {
  useGetViewerQuery,
  UserBasicData,
} from '../../../lib/networking/queries/useGetViewerQuery'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { LinkedItemCard } from '../../patterns/LibraryCards/LinkedItemCard'
import { Box, HStack, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import { AddLinkModal } from '../AddLinkModal'
import { EditLibraryItemModal } from './EditItemModals'
import { EmptyLibrary } from './EmptyLibrary'
import { HighlightItemsLayout } from './HighlightsLayout'
import { LibraryFilterMenu } from '../navMenu/LibraryMenu'
import { LibraryLegacyMenu } from '../navMenu/LibraryLegacyMenu'
import { LegacyLibraryHeader, MultiSelectMode } from './LibraryHeader'
import { UploadModal } from '../UploadModal'
import { BulkAction } from '../../../lib/networking/mutations/bulkActionMutation'
import { bulkActionMutation } from '../../../lib/networking/mutations/bulkActionMutation'
import {
  showErrorToast,
  showSuccessToast,
  showSuccessToastWithAction,
} from '../../../lib/toastHelpers'
import { SetPageLabelsModalPresenter } from '../article/SetLabelsModalPresenter'
import { NotebookPresenter } from '../article/NotebookPresenter'
import { saveUrlMutation } from '../../../lib/networking/mutations/saveUrlMutation'
import { articleQuery } from '../../../lib/networking/queries/useGetArticleQuery'
import { PinnedButtons } from './PinnedButtons'
import { PinnedSearch } from '../../../pages/settings/pinned-searches'
import { FetchItemsError } from './FetchItemsError'
import { TLDRLayout } from './TLDRLayout'

export type LayoutType = 'LIST_LAYOUT' | 'GRID_LAYOUT'
export type LibraryMode = 'reads' | 'highlights' | 'tldr'

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

// We set a relatively high delay for the refresh at the end, as it's likely there's an issue
// in processing. We give it the best attempt to be able to resolve, but if it doesn't we set
// the state as Failed. On refresh it will try again if the backend sends "PROCESSING"
const TIMEOUT_DELAYS = [2000, 3500, 5000]

export function HomeFeedContainer(): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const router = useRouter()
  const { queryValue } = useKBar((state) => ({ queryValue: state.searchQuery }))
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const [mode, setMode] = useState<LibraryMode>('reads')

  const defaultQuery = {
    limit: 10,
    sortDescending: true,
    searchQuery: undefined,
  }

  const gridContainerRef = useRef<HTMLDivElement>(null)

  const [labelsTarget, setLabelsTarget] = useState<LibraryItem | undefined>(
    undefined
  )

  const [notebookTarget, setNotebookTarget] = useState<LibraryItem | undefined>(
    undefined
  )

  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [showEditTitleModal, setShowEditTitleModal] = useState(false)
  const [linkToEdit, setLinkToEdit] = useState<LibraryItem>()
  const [linkToUnsubscribe, setLinkToUnsubscribe] = useState<LibraryItem>()

  const [queryInputs, setQueryInputs] =
    useState<LibraryItemsQueryInput>(defaultQuery)

  const {
    itemsPages,
    size,
    setSize,
    isValidating,
    performActionOnItem,
    mutate,
    error: fetchItemsError,
  } = useGetLibraryItemsQuery('inbox', queryInputs)

  useEffect(() => {
    const handleRevalidate = () => {
      ;(async () => {
        console.log('revalidating library')
        await mutate()
      })()
    }
    document.addEventListener('revalidateLibrary', handleRevalidate)
    return () => {
      document.removeEventListener('revalidateLibrary', handleRevalidate)
    }
  }, [mutate])

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
    console.log('ueryInputs.searchQuery', queryInputs.searchQuery)
    if (
      queryInputs.searchQuery &&
      queryInputs.searchQuery?.indexOf('mode:highlights') > -1
    ) {
      setMode('highlights')
    } else if (
      queryInputs.searchQuery &&
      queryInputs.searchQuery?.indexOf('mode:tldr') > -1
    ) {
      setMode('tldr')
    } else {
      setMode('reads')
    }
    setMultiSelectMode('off')
  }, [queryInputs])

  useEffect(() => {
    if (!router.isReady) return
    const q = router.query['q']
    let qs = 'in:inbox' // Default to in:inbox search term.
    if (q && typeof q === 'string') {
      qs = q
    }

    if (qs !== (queryInputs.searchQuery || '')) {
      setQueryInputs({ ...queryInputs, searchQuery: qs })
      performActionOnItem('refresh', undefined as unknown as any)
    }
    const mode = router.query['mode']

    // intentionally not watching queryInputs and performActionOnItem
    // here to prevent infinite looping
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMode, setQueryInputs, router.isReady, router.query])

  const hasMore = useMemo(() => {
    if (!itemsPages) {
      return false
    }
    return itemsPages[itemsPages.length - 1].search.pageInfo.hasNextPage
  }, [itemsPages])

  const libraryItems = useMemo(() => {
    const items =
      itemsPages?.flatMap((ad) => {
        return ad.search.edges.map((it) => ({
          ...it,
          isLoading: it.node.state === 'PROCESSING',
        }))
      }) || []
    return items
  }, [itemsPages, performActionOnItem])

  useEffect(() => {
    if (localStorage) {
      localStorage.setItem(
        'library-slug-list',
        JSON.stringify(libraryItems.map((li) => li.node.slug))
      )
    }
  }, [libraryItems])

  useEffect(() => {
    const timeout: NodeJS.Timeout[] = []

    const items = (
      itemsPages?.flatMap((ad) => {
        return ad.search.edges.map((it) => ({
          ...it,
          isLoading: it.node.state === 'PROCESSING',
        }))
      }) || []
    ).filter((it) => it.isLoading)

    items.map(async (item) => {
      let startIdx = 0

      const seeIfUpdated = async () => {
        if (startIdx >= TIMEOUT_DELAYS.length) {
          item.node.state = State.FAILED
          const updatedArticle = { ...item }
          updatedArticle.node = { ...item.node }
          updatedArticle.isLoading = false
          performActionOnItem('update-item', updatedArticle)
          return
        }

        const username = viewerData?.me?.profile.username
        const itemsToUpdate = libraryItems.filter((it) => it.isLoading)

        if (itemsToUpdate.length > 0) {
          const link = await articleQuery({
            username,
            slug: item.node.id,
            includeFriendsHighlights: false,
          })

          if (link && link.state != 'PROCESSING') {
            const updatedArticle = { ...item }
            updatedArticle.node = { ...item.node, ...link }
            updatedArticle.isLoading = false
            console.log(`Updating Metadata of ${item.node.slug}.`)
            performActionOnItem('update-item', updatedArticle)
            return
          }

          console.log(
            `Trying to get the metadata of item ${item.node.slug}... Retry ${startIdx} of 5`
          )
          timeout.push(setTimeout(seeIfUpdated, TIMEOUT_DELAYS[startIdx++]))
        }
      }

      await seeIfUpdated()
    })

    return () => {
      timeout.forEach(clearTimeout)
    }
  }, [itemsPages])

  const handleFetchMore = useCallback(() => {
    if (isValidating || !hasMore) {
      return
    }
    setSize(size + 1)
  }, [size, isValidating])

  useEffect(() => {
    if (isValidating || !hasMore || size !== 1) {
      return
    }
    setSize(size + 1)
  }, [size, isValidating])

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
    if (activeCardId && !alreadyScrolled.current) {
      scrollToActiveCard(activeCardId)
      alreadyScrolled.current = true

      if (activeItem) {
        performActionOnItem('refresh', activeItem)
      }
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
        const username = viewerData?.me?.profile.username
        if (username) {
          setActiveCardId(item.node.id)
          if (item.node.state === State.PROCESSING) {
            router.push(`/article?url=${encodeURIComponent(item.node.url)}`)
          } else {
            const dl =
              item.node.pageType === PageType.HIGHLIGHTS
                ? `#${item.node.id}`
                : ''
            router.push(`/${username}/${item.node.slug}` + dl)
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
        performActionOnItem('archive', item)
        break
      case 'unarchive':
        performActionOnItem('unarchive', item)
        break
      case 'delete':
        performActionOnItem('delete', item)
        break
      case 'mark-read':
        performActionOnItem('mark-read', item)
        break
      case 'mark-unread':
        performActionOnItem('mark-unread', item)
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
        performActionOnItem('unsubscribe', item)
      case 'update-item':
        performActionOnItem('update-item', item)
        break
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

  const ARCHIVE_ACTION = !activeItem?.node.isArchived
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
        const username = viewerData?.me?.profile.username
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
  useFetchMore(handleFetchMore)

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
          itemsPages?.flatMap((ad) => {
            return ad.search.edges
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
        const expectedCount =
          multiSelectMode === 'search'
            ? itemsPages?.[0].search.pageInfo.totalCount || 0
            : checkedItems.length

        try {
          const res = await bulkActionMutation(
            action,
            query,
            expectedCount,
            labelIds
          )
          if (res) {
            let successMessage: string | undefined = undefined
            console.log(action)
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
        mutate()
      })()
      setMultiSelectMode('off')
    },
    [itemsPages, multiSelectMode, checkedItems]
  )

  const handleLinkSubmission = async (
    link: string,
    timezone: string,
    locale: string
  ) => {
    const result = await saveUrlMutation(link, timezone, locale)
    if (result) {
      showSuccessToastWithAction('Link saved', 'Read now', async () => {
        window.location.href = `/article?url=${encodeURIComponent(link)}`
        return Promise.resolve()
      })
      const id = result.url?.match(/[^/]+$/)?.[0] ?? ''
      performActionOnItem('refresh', undefined as unknown as any)
    } else {
      showErrorToast('Error saving link', { position: 'bottom-right' })
    }
  }

  return (
    <HomeFeedGrid
      items={libraryItems}
      actionHandler={handleCardAction}
      reloadItems={mutate}
      setIsChecked={setIsChecked}
      itemIsChecked={itemIsChecked}
      multiSelectMode={multiSelectMode}
      setMultiSelectMode={setMultiSelectMode}
      performMultiSelectAction={performMultiSelectAction}
      searchTerm={queryInputs.searchQuery}
      gridContainerRef={gridContainerRef}
      mode={mode}
      setMode={setMode}
      handleLinkSubmission={handleLinkSubmission}
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
        performActionOnItem('refresh', undefined as unknown as any)
      }}
      loadMore={() => {
        if (isValidating) {
          return
        }
        setSize(size + 1)
      }}
      hasMore={hasMore}
      hasData={!!itemsPages}
      totalItems={itemsPages?.[0].search.pageInfo.totalCount || 0}
      isValidating={isValidating}
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
      numItemsSelected={
        multiSelectMode == 'search'
          ? itemsPages?.[0].search.pageInfo.totalCount || 0
          : checkedItems.length
      }
    />
  )
}

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

function HomeFeedGrid(props: HomeFeedContentProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const [layout, setLayout] = usePersistedState<LayoutType>({
    key: 'libraryLayout',
    initialValue: 'LIST_LAYOUT',
  })
  const [navMenuStyle] = usePersistedState<'legacy' | 'shortcuts'>({
    key: 'library-nav-menu-style',
    initialValue: 'legacy',
  })

  const updateLayout = useCallback(
    async (newLayout: LayoutType) => {
      if (layout === newLayout) return
      setLayout(newLayout)
    },
    [layout, setLayout]
  )

  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const showItems = useMemo(() => {
    if (props.fetchItemsError) {
      return false
    }
    if (!props.isValidating && props.items.length <= 0) {
      return false
    }
    return true
  }, [props])

  return (
    <VStack
      css={{
        height: '100%',
        width: !showItems || props.mode == 'highlights' ? '100%' : 'unset',
      }}
    >
      {props.mode != 'highlights' && (
        <LegacyLibraryHeader
          layout={layout}
          viewer={viewerData?.me}
          updateLayout={updateLayout}
          searchTerm={props.searchTerm}
          applySearchQuery={(searchQuery: string) => {
            props.applySearchQuery(searchQuery)
          }}
          mode={props.mode}
          setMode={props.setMode}
          showFilterMenu={showFilterMenu}
          setShowFilterMenu={setShowFilterMenu}
          multiSelectMode={props.multiSelectMode}
          setMultiSelectMode={props.setMultiSelectMode}
          numItemsSelected={props.numItemsSelected}
          performMultiSelectAction={props.performMultiSelectAction}
        />
      )}

      <HStack css={{ width: '100%', height: '100%' }}>
        {navMenuStyle == 'shortcuts' && (
          <LibraryFilterMenu
            setShowAddLinkModal={props.setShowAddLinkModal}
            searchTerm={props.searchTerm}
            applySearchQuery={(searchQuery: string) => {
              props.applySearchQuery(searchQuery)
            }}
            showFilterMenu={showFilterMenu}
            setShowFilterMenu={setShowFilterMenu}
          />
        )}
        {navMenuStyle == 'legacy' && (
          <LibraryLegacyMenu
            setShowAddLinkModal={props.setShowAddLinkModal}
            searchTerm={props.searchTerm}
            applySearchQuery={(searchQuery: string) => {
              props.applySearchQuery(searchQuery)
            }}
            showFilterMenu={showFilterMenu}
            setShowFilterMenu={setShowFilterMenu}
          />
        )}

        {!showItems && props.fetchItemsError && <FetchItemsError />}
        {!showItems && !props.fetchItemsError && props.items.length <= 0 && (
          <EmptyLibrary
            searchTerm={props.searchTerm}
            onAddLinkClicked={() => {
              props.setShowAddLinkModal(true)
            }}
          />
        )}

        {showItems && props.mode == 'highlights' && (
          <HighlightItemsLayout
            gridContainerRef={props.gridContainerRef}
            items={props.items}
            viewer={viewerData?.me}
            showFilterMenu={showFilterMenu}
            setShowFilterMenu={setShowFilterMenu}
          />
        )}

        {showItems && props.mode == 'reads' && (
          <LibraryItemsLayout
            viewer={viewerData?.me}
            layout={layout}
            isChecked={props.itemIsChecked}
            {...props}
          />
        )}

        {showItems && props.mode == 'tldr' && (
          <TLDRLayout viewer={viewerData?.me} layout={layout} {...props} />
        )}

        {props.showAddLinkModal && (
          <AddLinkModal
            handleLinkSubmission={props.handleLinkSubmission}
            onOpenChange={() => props.setShowAddLinkModal(false)}
          />
        )}
      </HStack>
    </VStack>
  )
}

type LibraryItemsLayoutProps = {
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
          minHeight: '100vh',
        }}
      >
        <Toaster />

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
            mb: '10px',
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

        {props.isValidating && props.items.length == 0 && <TopBarProgress />}
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
          <LibraryItems
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
              <Button
                style="ctaGray"
                css={{
                  cursor: props.isValidating ? 'not-allowed' : 'pointer',
                }}
                onClick={props.loadMore}
                disabled={props.isValidating}
              >
                {props.isValidating ? 'Loading' : 'Load More'}
              </Button>
            ) : (
              <StyledText style="caption"></StyledText>
            )}
          </HStack>
        </div>
      </VStack>
      {props.showEditTitleModal && (
        <EditLibraryItemModal
          updateItem={(item: LibraryItem) =>
            props.actionHandler('update-item', item)
          }
          onOpenChange={() => {
            props.setShowEditTitleModal(false)
            props.setLinkToEdit(undefined)
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
          articleId={props.labelsTarget.node.id}
          article={props.labelsTarget.node}
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

function LibraryItems(props: LibraryItemsProps): JSX.Element {
  return (
    <Box
      ref={props.gridContainerRef}
      css={{
        py: '$3',
        display: 'grid',
        width: '100%',
        gridAutoRows: 'auto',
        borderRadius: '6px',
        gridGap: props.layout == 'LIST_LAYOUT' ? '10px' : '20px',
        marginTop: '10px',
        marginBottom: '0px',
        paddingTop: '0',
        paddingBottom: '0px',
        overflow: 'visible',
        '@media (max-width: 930px)': {
          gridGap: props.layout == 'LIST_LAYOUT' ? '0px' : '20px',
        },
        '@xlgDown': {
          borderRadius: props.layout == 'LIST_LAYOUT' ? 0 : undefined,
        },
        '@smDown': {
          border: 'unset',
          width: props.layout == 'LIST_LAYOUT' ? '100vw' : undefined,
          margin: props.layout == 'LIST_LAYOUT' ? '16px -16px' : undefined,
          borderRadius: props.layout == 'LIST_LAYOUT' ? 0 : undefined,
        },
        '@media (min-width: 930px)': {
          gridTemplateColumns:
            props.layout == 'LIST_LAYOUT' ? 'none' : 'repeat(2, 1fr)',
        },
        '@media (min-width: 1280px)': {
          gridTemplateColumns:
            props.layout == 'LIST_LAYOUT' ? 'none' : 'repeat(3, 1fr)',
        },
        '@media (min-width: 1600px)': {
          gridTemplateColumns:
            props.layout == 'LIST_LAYOUT' ? 'none' : 'repeat(4, 1fr)',
        },
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
              bg: '$thLeftMenuBackground',
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
              legacyLayout={true}
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
