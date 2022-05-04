import { Box, HStack, VStack } from './../../elements/LayoutPrimitives'
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
import { styled } from '../../tokens/stitches.config'
import { ListLayoutIcon } from '../../elements/images/ListLayoutIcon'
import { GridLayoutIcon } from '../../elements/images/GridLayoutIcon'
import {
  libraryListCommands,
  searchBarCommands,
} from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { ShareArticleModal } from '../article/ShareArticleModal'
import { userPersonalizationMutation } from '../../../lib/networking/mutations/userPersonalizationMutation'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { webBaseURL } from '../../../lib/appConfig'
import { Toaster } from 'react-hot-toast'
import { SnoozeLinkModal } from '../article/SnoozeLinkModal'
import {
  createReminderMutation,
  ReminderType,
} from '../../../lib/networking/mutations/createReminderMutation'
import { useFetchMoreScroll } from '../../../lib/hooks/useFetchMoreScroll'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { SetLabelsModal } from '../article/SetLabelsModal'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { isVipUser } from '../../../lib/featureFlag'
import { EmptyLibrary } from './EmptyLibrary'
import TopBarProgress from 'react-topbar-progress-indicator'

export type LayoutType = 'LIST_LAYOUT' | 'GRID_LAYOUT'

export type HomeFeedContainerProps = {
  scrollElementRef: React.RefObject<HTMLDivElement>
}

const timeZoneHourDiff = -new Date().getTimezoneOffset() / 60

const SAVED_SEARCHES: Record<string, string> = {
  Inbox: `in:inbox`,
  'Read Later': `in:inbox -label:Newsletter`,
  Highlighted: `in:inbox has:highlights`,
  Today: `in:inbox saved:${
    new Date(new Date().getTime() - 24 * 3600000).toISOString().split('T')[0]
  }Z${timeZoneHourDiff.toLocaleString('en-US', {
    signDisplay: 'always',
  })}..*`,
  Newsletters: `in:inbox label:Newsletter`,
}

export function HomeFeedContainer(props: HomeFeedContainerProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const router = useRouter()
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

  const [queryInputs, setQueryInputs] =
    useState<LibraryItemsQueryInput>(defaultQuery)

  useKeyboardShortcuts(
    searchBarCommands((action) => {
      if (action === 'clearSearch') {
        setQueryInputs(defaultQuery)
      }
    })
  )

  useEffect(() => {
    if (!router.isReady) return
    const q = router.query['q']
    let qs = ''
    if (q && typeof q === 'string') {
      qs = q
    }
    if (qs !== (queryInputs.searchQuery || '')) {
      setQueryInputs({ ...queryInputs, searchQuery: qs })
    }
    // intentionally not watching queryInputs here to prevent infinite looping
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setQueryInputs, router.isReady, router.query])

  const { articlesPages, size, setSize, isValidating, performActionOnItem } =
    useGetLibraryItemsQuery(queryInputs)

  const hasMore = useMemo(() => {
    if (!articlesPages) {
      return false
    }
    return articlesPages[articlesPages.length - 1].articles.pageInfo.hasNextPage
  }, [articlesPages])

  const libraryItems = useMemo(() => {
    const items =
      articlesPages?.flatMap((ad) => {
        return ad.articles.edges
      }) || []
    return items
  }, [articlesPages, performActionOnItem])

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

  const isVisible = function (ele: HTMLElement, container: HTMLElement) {
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
            if (
              props.scrollElementRef.current &&
              !isVisible(target, props.scrollElementRef.current)
            ) {
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
          router.push(`/${username}/${item.node.id}`)
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
    }
  }

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
      if (labelsTarget || snoozeTarget || shareTarget) {
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

  const setFetchMoreRef = useFetchMoreScroll(handleFetchMore)

  useEffect(() => {
    setFetchMoreRef(props.scrollElementRef.current)
  }, [props.scrollElementRef, setFetchMoreRef])

  return (
    <HomeFeedGrid
      items={libraryItems}
      actionHandler={handleCardAction}
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
      }}
      loadMore={() => {
        if (isValidating) {
          return
        }
        setSize(size + 1)
      }}
      hasMore={hasMore}
      hasData={!!articlesPages}
      totalItems={articlesPages?.[0].articles.pageInfo.totalCount || 0}
      isValidating={isValidating}
      shareTarget={shareTarget}
      setShareTarget={setShareTarget}
      snoozeTarget={snoozeTarget}
      setSnoozeTarget={setSnoozeTarget}
      labelsTarget={labelsTarget}
      setLabelsTarget={setLabelsTarget}
      showAddLinkModal={showAddLinkModal}
      setShowAddLinkModal={setShowAddLinkModal}
      setActiveItem={(item: LibraryItem) => {
        activateCard(item.node.id)
      }}
    />
  )
}

type HomeFeedContentProps = {
  items: LibraryItem[]
  searchTerm?: string
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
  setActiveItem: (item: LibraryItem) => void
  actionHandler: (
    action: LinkedItemCardAction,
    item: LibraryItem | undefined
  ) => Promise<void>
}

function HomeFeedGrid(props: HomeFeedContentProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()

  const { preferencesData, isValidating: isValidatingPreferences } =
    useGetUserPreferences()
  const [layout, setLayout] = useState<LayoutType>(
    (preferencesData?.libraryLayoutType as LayoutType) || 'GRID_LAYOUT'
  )
  const [showRemoveLinkConfirmation, setShowRemoveLinkConfirmation] =
    useState(false)
  const [linkToRemove, setLinkToRemove] = useState<LibraryItem>()

  const updateLayout = useCallback(
    async (newLayout: LayoutType) => {
      if (layout === newLayout) return
      setLayout(newLayout)
      userPersonalizationMutation({ libraryLayoutType: newLayout })
    },
    [layout, setLayout]
  )

  const [, updateState] = useState({})

  const StyledToggleButton = styled('button', {
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

  const removeItem = () => {
    if (!linkToRemove) {
      return
    }

    props.actionHandler('delete', linkToRemove)
    setLinkToRemove(undefined)
    setShowRemoveLinkConfirmation(false)
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
            {!isValidatingPreferences && (
              <>
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
              </>
            )}
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
        {viewerData?.me && isVipUser(viewerData?.me) && (
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
                margin: layout == 'LIST_LAYOUT' ? '16px -16px' : undefined,
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
                        setLinkToRemove(linkedItem)
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
      </VStack>
      {props.showAddLinkModal && (
        <AddLinkModal onOpenChange={() => props.setShowAddLinkModal(false)} />
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
          message={'Are you sure you want to remove this link?'}
          onAccept={removeItem}
          onOpenChange={() => setShowRemoveLinkConfirmation(false)}
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
