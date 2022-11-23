import { Box, HStack, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import Dropzone from 'react-dropzone'
import * as Progress from '@radix-ui/react-progress'
import type {
  LibraryItem,
  LibraryItemsQueryInput,
} from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { useGetLibraryItemsQuery } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { LinkedItemCard } from '../../patterns/LibraryCards/LinkedItemCard'
import { useRouter } from 'next/router'
import { Button } from '../../elements/Button'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LibrarySearchBar } from './LibrarySearchBar'
import { StyledText } from '../../elements/StyledText'
import { AddLinkModal } from './AddLinkModal'
import { styled, theme } from '../../tokens/stitches.config'
import { ListLayoutIcon } from '../../elements/images/ListLayoutIcon'
import { GridLayoutIcon } from '../../elements/images/GridLayoutIcon'
import {
  libraryListCommands,
  searchBarCommands,
} from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { ShareArticleModal } from '../article/ShareArticleModal'
import { webBaseURL } from '../../../lib/appConfig'
import { Toaster } from 'react-hot-toast'
import { SnoozeLinkModal } from '../article/SnoozeLinkModal'
import {
  createReminderMutation,
  ReminderType,
} from '../../../lib/networking/mutations/createReminderMutation'
import { useFetchMore } from '../../../lib/hooks/useFetchMoreScroll'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { SetLabelsModal } from '../article/SetLabelsModal'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { EmptyLibrary } from './EmptyLibrary'
import TopBarProgress from 'react-topbar-progress-indicator'
import {
  PageType,
  State,
} from '../../../lib/networking/fragments/articleFragment'
import { Action, createAction, useKBar, useRegisterActions } from 'kbar'
import { EditTitleModal } from './EditTitleModal'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import debounce from 'lodash/debounce'
import {
  SearchItem,
  TypeaheadSearchItemsData,
  typeaheadSearchQuery,
} from '../../../lib/networking/queries/typeaheadSearch'
import axios from 'axios'
import { uploadFileRequestMutation } from '../../../lib/networking/mutations/uploadFileMutation'

export type LayoutType = 'LIST_LAYOUT' | 'GRID_LAYOUT'

const timeZoneHourDiff = -new Date().getTimezoneOffset() / 60

const SAVED_SEARCHES: Record<string, string> = {
  Inbox: `in:inbox`,
  'Read Later': `in:inbox -label:Newsletter`,
  Highlights: `type:highlights`,
  Today: `in:inbox saved:${
    new Date(new Date().getTime() - 24 * 3600000).toISOString().split('T')[0]
  }Z${timeZoneHourDiff.toLocaleString('en-US', {
    signDisplay: 'always',
  })}..*`,
  Newsletters: `in:inbox label:Newsletter`,
}

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

export function HomeFeedContainer(): JSX.Element {
  useGetUserPreferences()

  const { viewerData } = useGetViewerQuery()
  const router = useRouter()
  const { queryValue } = useKBar((state) => ({ queryValue: state.searchQuery }))
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])

  const defaultQuery = {
    limit: 10,
    sortDescending: true,
    searchQuery: undefined,
  }

  const gridContainerRef = useRef<HTMLDivElement>(null)

  const [shareTarget, setShareTarget] = useState<LibraryItem | undefined>(
    undefined
  )

  const [snoozeTarget, setSnoozeTarget] = useState<LibraryItem | undefined>(
    undefined
  )

  const [labelsTarget, setLabelsTarget] = useState<LibraryItem | undefined>(
    undefined
  )

  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [showEditTitleModal, setShowEditTitleModal] = useState(false)
  const [linkToRemove, setLinkToRemove] = useState<LibraryItem>()
  const [linkToEdit, setLinkToEdit] = useState<LibraryItem>()
  const [linkToUnsubscribe, setLinkToUnsubscribe] = useState<LibraryItem>()

  const [queryInputs, setQueryInputs] =
    useState<LibraryItemsQueryInput>(defaultQuery)

  useKeyboardShortcuts(
    searchBarCommands((action) => {
      if (action === 'clearSearch') {
        setQueryInputs(defaultQuery)
      }
    })
  )

  const {
    itemsPages,
    size,
    setSize,
    isValidating,
    performActionOnItem,
    mutate,
  } = useGetLibraryItemsQuery(queryInputs)

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
      performActionOnItem('refresh', undefined as unknown as any)
    }
    // intentionally not watching queryInputs here to prevent infinite looping
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setQueryInputs, router.isReady, router.query, performActionOnItem])

  const hasMore = useMemo(() => {
    if (!itemsPages) {
      return false
    }
    return itemsPages[itemsPages.length - 1].search.pageInfo.hasNextPage
  }, [itemsPages])

  const libraryItems = useMemo(() => {
    const items =
      itemsPages?.flatMap((ad) => {
        return ad.search.edges
      }) || []
    return items
  }, [itemsPages, performActionOnItem])

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
        console.log('refreshing')
        // refresh items on home feed
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
            router.push(`/${username}/links/${item.node.id}`)
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
      case 'share':
        setShareTarget(item)
        break
      case 'snooze':
        setSnoozeTarget(item)
        break
      case 'set-labels':
        setLabelsTarget(item)
        break
      case 'unsubscribe':
        performActionOnItem('unsubscribe', item)
      case 'update-item':
        performActionOnItem('update-item', item)
        break
    }
  }

  const modalTargetItem = useMemo(() => {
    return (
      labelsTarget ||
      snoozeTarget ||
      shareTarget ||
      linkToEdit ||
      linkToRemove ||
      linkToUnsubscribe
    )
  }, [
    labelsTarget,
    snoozeTarget,
    shareTarget,
    linkToEdit,
    linkToRemove,
    linkToUnsubscribe,
  ])

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
          handleCardAction('showDetail', activeItem)
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
        case 'shareItem':
          setShareTarget(activeItem)
          break
        case 'sortDescending':
          setQueryInputs({ ...queryInputs, sortDescending: true })
          break
        case 'sortAscending':
          setQueryInputs({ ...queryInputs, sortDescending: false })
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
      shortcut: ['r'],
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
      name: 'Mark item as read',
      shortcut: ['Shift', 'i'],
      perform: () => handleCardAction('mark-read', activeItem),
    }),
    createAction({
      section: 'Library',
      name: 'Mark item as unread',
      shortcut: ['Shift', 'u'],
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

  return (
    <HomeFeedGrid
      items={libraryItems}
      actionHandler={handleCardAction}
      reloadItems={mutate}
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
      shareTarget={shareTarget}
      setShareTarget={setShareTarget}
      snoozeTarget={snoozeTarget}
      setSnoozeTarget={setSnoozeTarget}
      labelsTarget={labelsTarget}
      setLabelsTarget={setLabelsTarget}
      showAddLinkModal={showAddLinkModal}
      setShowAddLinkModal={setShowAddLinkModal}
      showEditTitleModal={showEditTitleModal}
      setShowEditTitleModal={setShowEditTitleModal}
      setActiveItem={(item: LibraryItem) => {
        activateCard(item.node.id)
      }}
      linkToRemove={linkToRemove}
      setLinkToRemove={setLinkToRemove}
      linkToEdit={linkToEdit}
      setLinkToEdit={setLinkToEdit}
      linkToUnsubscribe={linkToUnsubscribe}
      setLinkToUnsubscribe={setLinkToUnsubscribe}
    />
  )
}

type HomeFeedContentProps = {
  items: LibraryItem[]
  searchTerm?: string
  reloadItems: () => void
  gridContainerRef: React.RefObject<HTMLDivElement>
  applySearchQuery: (searchQuery: string) => void
  hasMore: boolean
  hasData: boolean
  totalItems: number
  isValidating: boolean
  loadMore: () => void
  shareTarget: LibraryItem | undefined
  setShareTarget: (target: LibraryItem | undefined) => void
  snoozeTarget: LibraryItem | undefined
  setSnoozeTarget: (target: LibraryItem | undefined) => void
  labelsTarget: LibraryItem | undefined
  setLabelsTarget: (target: LibraryItem | undefined) => void
  showAddLinkModal: boolean
  setShowAddLinkModal: (show: boolean) => void
  showEditTitleModal: boolean
  setShowEditTitleModal: (show: boolean) => void
  setActiveItem: (item: LibraryItem) => void

  linkToRemove: LibraryItem | undefined
  setLinkToRemove: (set: LibraryItem | undefined) => void
  linkToEdit: LibraryItem | undefined
  setLinkToEdit: (set: LibraryItem | undefined) => void
  linkToUnsubscribe: LibraryItem | undefined
  setLinkToUnsubscribe: (set: LibraryItem | undefined) => void

  actionHandler: (
    action: LinkedItemCardAction,
    item: LibraryItem | undefined
  ) => Promise<void>
}

function HomeFeedGrid(props: HomeFeedContentProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const [layout, setLayout] = usePersistedState<LayoutType>({
    key: 'libraryLayout',
    initialValue: 'GRID_LAYOUT',
  })
  const [showRemoveLinkConfirmation, setShowRemoveLinkConfirmation] =
    useState(false)
  const [showUnsubscribeConfirmation, setShowUnsubscribeConfirmation] =
    useState(false)

  const updateLayout = useCallback(
    async (newLayout: LayoutType) => {
      if (layout === newLayout) return
      setLayout(newLayout)
    },
    [layout, setLayout]
  )

  const [, updateState] = useState({})

  const StyledToggleButton = styled('button', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: '0px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    '&:hover': {
      opacity: 0.8,
    },
    '&[data-state="on"]': {
      bg: 'rgb(43, 43, 43)',
    },
  })

  const DragnDropContainer = styled('div', {
    width: '100%',
    height: '80%',
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1',
    alignSelf: 'center',
    left: 0,
  })

  const DragnDropStyle = styled('div', {
    border: '3px dashed gray',
    backgroundColor: 'aliceblue',
    borderRadius: '5px',
    width: '100%',
    height: '100%',
    opacity: '0.9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    left: 0,
    margin: '16px',
  })

  const removeItem = () => {
    if (!props.linkToRemove) {
      return
    }

    props.actionHandler('delete', props.linkToRemove)
    props.setLinkToRemove(undefined)
    setShowRemoveLinkConfirmation(false)
  }

  const unsubscribe = () => {
    if (!props.linkToUnsubscribe) {
      return
    }
    props.actionHandler('unsubscribe', props.linkToUnsubscribe)
    props.setLinkToUnsubscribe(undefined)
    setShowUnsubscribeConfirmation(false)
  }

  const [uploadingFiles, setUploadingFiles] = useState([])
  const [inDragOperation, setInDragOperation] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrop = async (acceptedFiles: any) => {
    setInDragOperation(false)
    setUploadingFiles(acceptedFiles.map((file: { name: any }) => file.name))

    for (const file of acceptedFiles) {
      try {
        const request = await uploadFileRequestMutation({
          // This will tell the backend not to save the URL
          // and give it the local filename as the title.
          url: `file://local/${file.path}`,
          contentType: file.type,
          createPageEntry: true,
        })
        if (!request?.uploadSignedUrl) {
          throw 'No upload URL available'
        }

        const uploadResult = await axios.request({
          method: 'PUT',
          url: request?.uploadSignedUrl,
          data: file,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/pdf',
          },
          onUploadProgress: (p) => {
            console.log('upload progress: ', (p.loaded / p.total) * 100)
            setUploadProgress((p.loaded / p.total) * 100)
          },
        })

        console.log('result of uploading: ', uploadResult)
      } catch (error) {
        console.log('ERROR', error)
      }
    }

    setUploadingFiles([])
    props.reloadItems()
  }

  return (
    <>
      <VStack
        alignment="center"
        css={{
          px: '$3',
          width: '100%',
          '@smDown': {
            px: '$2',
          },
        }}
      >
        <Toaster />

        {props.isValidating && props.items.length == 0 && <TopBarProgress />}
        <HStack alignment="center" distribution="start" css={{ width: '100%' }}>
          <StyledText
            style="subHeadline"
            css={{
              mr: '32px',
              '@smDown': {
                mr: '16px',
              },
            }}
          >
            Library
          </StyledText>
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StyledToggleButton
              data-state={layout === 'GRID_LAYOUT' ? 'on' : 'off'}
              onClick={() => {
                updateLayout('GRID_LAYOUT')
              }}
            >
              <GridLayoutIcon color={'rgb(211, 211, 213)'} />
            </StyledToggleButton>
            <StyledToggleButton
              data-state={layout === 'LIST_LAYOUT' ? 'on' : 'off'}
              onClick={() => {
                updateLayout('LIST_LAYOUT')
              }}
            >
              <ListLayoutIcon color={'rgb(211, 211, 213)'} />
            </StyledToggleButton>
          </Box>
          <Button
            style="ctaDarkYellow"
            css={{ marginLeft: 'auto' }}
            onClick={() => {
              props.setShowAddLinkModal(true)
            }}
          >
            Add Link
          </Button>
        </HStack>
        <LibrarySearchBar
          searchTerm={props.searchTerm}
          applySearchQuery={props.applySearchQuery}
        />

        {viewerData?.me && (
          <Box
            css={{
              display: 'flex',
              width: '100%',
              height: '44px',
              marginTop: '16px',
              gap: '8px',
              flexDirection: 'row',
              overflowY: 'scroll',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            {Object.keys(SAVED_SEARCHES).map((key) => {
              const isInboxTerm = (term: string) => {
                return !term || term === 'in:inbox'
              }

              const searchQuery = SAVED_SEARCHES[key]
              const style =
                searchQuery === props.searchTerm ||
                (!props.searchTerm && isInboxTerm(searchQuery))
                  ? 'ctaDarkYellow'
                  : 'ctaLightGray'
              return (
                <Button
                  key={key}
                  style={style}
                  onClick={() => {
                    props.applySearchQuery(searchQuery)
                  }}
                  css={{
                    p: '10px 12px',
                    height: '37.5px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {key}
                </Button>
              )
            })}
          </Box>
        )}
        <Dropzone
          onDrop={handleDrop}
          onDragEnter={() => {
            setInDragOperation(true)
          }}
          onDragLeave={() => {
            setInDragOperation(false)
          }}
          preventDropOnDocument={true}
          noClick={true}
          accept={{
            'application/pdf': ['.pdf'],
          }}
        >
          {({ getRootProps, getInputProps, acceptedFiles, fileRejections }) => (
            <div
              {...getRootProps({ className: 'dropzone' })}
              style={{ width: '100%', height: '100%' }}
            >
              {inDragOperation && uploadingFiles.length < 1 && (
                <DragnDropContainer>
                  <DragnDropStyle>
                    <Box
                      css={{
                        color: '$utilityTextDefault',
                        fontWeight: '800',
                        fontSize: '$4',
                      }}
                    >
                      Drop PDF document to to upload and add to your library
                    </Box>
                  </DragnDropStyle>
                </DragnDropContainer>
              )}
              {uploadingFiles.length > 0 && (
                <DragnDropContainer>
                  <DragnDropStyle>
                    <Box
                      css={{
                        color: '$utilityTextDefault',
                        fontWeight: '800',
                        fontSize: '$4',
                        width: '80%',
                      }}
                    >
                      <Progress.Root
                        className="ProgressRoot"
                        value={uploadProgress}
                      >
                        <Progress.Indicator
                          className="ProgressIndicator"
                          style={{
                            transform: `translateX(-${100 - uploadProgress}%)`,
                          }}
                        />
                      </Progress.Root>
                      <StyledText
                        style="boldText"
                        css={{
                          color: theme.colors.omnivoreGray.toString(),
                        }}
                      >
                        Uploading file
                      </StyledText>
                    </Box>
                  </DragnDropStyle>
                </DragnDropContainer>
              )}
              <input {...getInputProps()} />
              {!props.isValidating && props.items.length == 0 ? (
                <EmptyLibrary
                  onAddLinkClicked={() => {
                    props.setShowAddLinkModal(true)
                  }}
                />
              ) : (
                <Box
                  ref={props.gridContainerRef}
                  css={{
                    py: '$3',
                    display: 'grid',
                    width: '100%',
                    gridAutoRows: 'auto',
                    borderRadius: '8px',
                    gridGap: layout == 'LIST_LAYOUT' ? '0' : '$3',
                    marginTop: layout == 'LIST_LAYOUT' ? '21px' : '0',
                    marginBottom: '0px',
                    paddingTop: layout == 'LIST_LAYOUT' ? '0' : '21px',
                    paddingBottom: layout == 'LIST_LAYOUT' ? '0px' : '21px',
                    overflow: 'hidden',
                    '@smDown': {
                      border: 'unset',
                      width: layout == 'LIST_LAYOUT' ? '100vw' : undefined,
                      margin:
                        layout == 'LIST_LAYOUT' ? '16px -16px' : undefined,
                      borderRadius: layout == 'LIST_LAYOUT' ? 0 : undefined,
                    },
                    '@md': {
                      gridTemplateColumns:
                        layout == 'LIST_LAYOUT' ? 'none' : '1fr 1fr',
                    },
                    '@lg': {
                      gridTemplateColumns:
                        layout == 'LIST_LAYOUT' ? 'none' : 'repeat(3, 1fr)',
                    },
                  }}
                >
                  {props.items.map((linkedItem) => (
                    <Box
                      className="linkedItemCard"
                      data-testid="linkedItemCard"
                      id={linkedItem.node.id}
                      tabIndex={0}
                      key={linkedItem.node.id}
                      css={{
                        width: '100%',
                        '&> div': {
                          bg: '$grayBg',
                        },
                        '&:focus': {
                          '> div': {
                            bg: '$grayBgActive',
                          },
                        },
                        '&:hover': {
                          '> div': {
                            bg: '$grayBgActive',
                          },
                        },
                      }}
                    >
                      {viewerData?.me && (
                        <LinkedItemCard
                          layout={layout}
                          item={linkedItem.node}
                          viewer={viewerData.me}
                          handleAction={(action: LinkedItemCardAction) => {
                            if (action === 'delete') {
                              setShowRemoveLinkConfirmation(true)
                              props.setLinkToRemove(linkedItem)
                            } else if (action === 'editTitle') {
                              props.setShowEditTitleModal(true)
                              props.setLinkToEdit(linkedItem)
                            } else if (action == 'unsubscribe') {
                              setShowUnsubscribeConfirmation(true)
                              props.setLinkToUnsubscribe(linkedItem)
                            } else {
                              props.actionHandler(action, linkedItem)
                            }
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
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
          )}
        </Dropzone>
      </VStack>
      {/* Temporary code */}
      {/* <div>
        <strong>Files:</strong>
        <ul>
          {uploadingFiles.map((fileName) => (
            <li key={fileName}>{fileName}</li>
          ))}
        </ul>
      </div> */}
      {/* Temporary code */}
      {props.showAddLinkModal && (
        <AddLinkModal onOpenChange={() => props.setShowAddLinkModal(false)} />
      )}
      {props.showEditTitleModal && (
        <EditTitleModal
          updateItem={(item: LibraryItem) =>
            props.actionHandler('update-item', item)
          }
          onOpenChange={() => props.setShowEditTitleModal(false)}
          item={props.linkToEdit as LibraryItem}
        />
      )}
      {props.shareTarget && viewerData?.me?.profile.username && (
        <ShareArticleModal
          url={`${webBaseURL}${viewerData?.me?.profile.username}/${props.shareTarget.node.slug}/highlights?r=true`}
          title={props.shareTarget.node.title}
          imageURL={props.shareTarget.node.image}
          author={props.shareTarget.node.author}
          publishedAt={
            props.shareTarget.node.publishedAt ??
            props.shareTarget.node.createdAt
          }
          description={props.shareTarget.node.description}
          originalArticleUrl={props.shareTarget.node.originalArticleUrl}
          onOpenChange={() => {
            if (props.shareTarget) {
              const item = document.getElementById(props.shareTarget.node.id)
              if (item) {
                item.focus()
              }
              props.setShareTarget(undefined)
            }
          }}
        />
      )}
      {props.snoozeTarget && (
        <SnoozeLinkModal
          submit={(option: string, sendReminder: boolean, msg: string) => {
            if (!props.snoozeTarget) return
            createReminderMutation(
              props.snoozeTarget?.node.id,
              ReminderType.Tonight,
              true,
              sendReminder
            )
              .then(() => {
                return props.actionHandler('archive', props.snoozeTarget)
              })
              .then(() => {
                showSuccessToast(msg, { position: 'bottom-right' })
              })
              .catch((error) => {
                showErrorToast('There was an error snoozing your link.', {
                  position: 'bottom-right',
                })
              })
          }}
          onOpenChange={() => {
            if (props.snoozeTarget) {
              const item = document.getElementById(props.snoozeTarget.node.id)
              if (item) {
                item.focus()
              }
              props.setSnoozeTarget(undefined)
            }
          }}
        />
      )}
      {showRemoveLinkConfirmation && (
        <ConfirmationModal
          message={
            'Are you sure you want to remove this item? All associated notes and highlights will be deleted.'
          }
          onAccept={removeItem}
          onOpenChange={() => setShowRemoveLinkConfirmation(false)}
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
        <SetLabelsModal
          linkId={props.labelsTarget.node.id}
          labels={props.labelsTarget.node.labels}
          articleActionHandler={(action, value) => {
            switch (action) {
              case 'refreshLabels':
                if (props.labelsTarget) {
                  props.labelsTarget.node.labels = value as Label[] | undefined
                  updateState({})
                }
                break
            }
          }}
          onOpenChange={() => {
            if (props.labelsTarget) {
              const activate = props.labelsTarget
              props.setActiveItem(activate)
              props.setLabelsTarget(undefined)
            }
          }}
        />
      )}
    </>
  )
}
