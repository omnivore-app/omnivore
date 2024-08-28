import * as HoverCard from '@radix-ui/react-hover-card'
import { styled } from '@stitches/react'
import { useRouter } from 'next/router'
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useContext,
} from 'react'
import { Button } from '../elements/Button'
import { AddToLibraryActionIcon } from '../elements/icons/home/AddToLibraryActionIcon'
import { ArchiveActionIcon } from '../elements/icons/home/ArchiveActionIcon'
import { RemoveActionIcon } from '../elements/icons/home/RemoveActionIcon'
import { ShareActionIcon } from '../elements/icons/home/ShareActionIcon'
import Pagination from '../elements/Pagination'
import { timeAgo } from '../../lib/textFormatting'
import { theme } from '../tokens/stitches.config'
import { useApplyLocalTheme } from '../../lib/hooks/useApplyLocalTheme'
import { useGetHiddenHomeSection } from '../../lib/networking/queries/useGetHiddenHomeSection'
import {
  HomeItem,
  HomeItemResponse,
  HomeItemSource,
  HomeItemSourceType,
  HomeSection,
  useGetHomeItems,
} from '../../lib/networking/queries/useGetHome'
import {
  SubscriptionType,
  useGetSubscriptionsQuery,
} from '../../lib/networking/queries/useGetSubscriptionsQuery'
import { Box, HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import useLibraryItemActions from '../../lib/hooks/useLibraryItemActions'
import { SyncLoader } from 'react-spinners'
import { useGetLibraryItems } from '../../lib/networking/library_items/useLibraryItems'
import { useRegisterActions } from 'kbar'
import { useGetViewer } from '../../lib/networking/viewer/useGetViewer'

type HomeState = {
  items: HomeItem[]
  home?: HomeSection[]
  libraryItems?: HomeItem[]
  selectedItem: string | undefined
  selectedItemIdx: number | undefined

  serverHome?: HomeSection[]
  serverLibraryItems?: HomeItem[]
}

type Action =
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_HOME_ITEMS'; payload: HomeSection[] }
  | { type: 'SET_LIBRARY_ITEMS'; payload: HomeItem[] }
  | { type: 'SET_ACTIVE_ELEMENT'; payload: string | undefined }
  | { type: 'SET_ACTIVE_ELEMENT_IDX'; payload: number | undefined }

const flattenItems = (
  home: HomeSection[] | undefined,
  libraryItems: HomeItem[] | undefined
) => {
  if (!home) {
    return []
  }
  const result = [...home]
  // If we have library items, we need to find the top_picks section
  // and append them there.
  if (libraryItems) {
    const topPicks = result.find((section) => section.layout == 'top_picks')
    if (topPicks) {
      topPicks.title = 'From your library'
      topPicks.items = libraryItems
    } else {
      console.log('could not find top picks')
    }
  }
  return result
    .filter((section) => section.layout !== 'just_added')
    .flatMap((section) => section.items)
}

const removeItem = (
  itemId: string,
  home: HomeSection[] | undefined,
  libraryItems: HomeItem[] | undefined
) => {
  if (home) {
    home = home.map((section) => ({
      ...section,
      items: section.items.filter((item) => item.id !== itemId),
    }))
  }
  if (libraryItems) {
    libraryItems = libraryItems.filter((item) => item.id !== itemId)
  }
  return { home, libraryItems }
}

const updateSelectedItem = (
  currentSelectedItem: string | undefined,
  previousItems: HomeItem[],
  currentItems: HomeItem[]
) => {
  if (!currentSelectedItem) {
    return undefined
  }
  const currentIdx = currentItems.findIndex(
    (item) => item.id === currentSelectedItem
  )
  if (currentIdx !== -1) {
    // item has not been removed
    return currentSelectedItem
  }
  const previousIdx = previousItems.findIndex(
    (item) => item.id === currentSelectedItem
  )
  if (previousIdx >= 0 && previousIdx < currentItems.length - 1) {
    return currentItems[previousIdx].id
  }
  if (previousIdx >= 1 && previousIdx > currentItems.length - 1) {
    return currentItems[previousIdx - 1].id
  }
  return undefined
}

const initialState: HomeState = {
  items: [],
  selectedItem: undefined,
  selectedItemIdx: undefined,
}

const reducer = (state: HomeState, action: Action): HomeState => {
  console.log('action: ', action)
  switch (action.type) {
    case 'REMOVE_ITEM':
      const items = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items,
        selectedItem: updateSelectedItem(
          state.selectedItem,
          state.items,
          items
        ),
        ...removeItem(action.payload, state.home, state.libraryItems),
      }
    case 'SET_ACTIVE_ELEMENT':
      return {
        ...state,
        selectedItem: action.payload,
      }
    case 'SET_ACTIVE_ELEMENT_IDX':
      return {
        ...state,
        selectedItemIdx: action.payload,
      }
    case 'SET_HOME_ITEMS':
      return {
        ...state,
        home: [...action.payload],
        serverHome: [...action.payload],
        items: flattenItems(action.payload, undefined),
      }
    case 'SET_LIBRARY_ITEMS':
      return {
        ...state,
        libraryItems: [...action.payload],
        serverLibraryItems: [...action.payload],
        items: flattenItems(state.home, action.payload),
      }
    default:
      console.log('hitting default return ')
      return state
  }
}

type NavigationContextType = {
  state: HomeState
  dispatch: React.Dispatch<Action>
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
)

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

export function HomeContainer(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const homeData = useGetHomeItems()

  const router = useRouter()
  const { data: viewerData } = useGetViewer()

  const hasTopPicks = (homeData: HomeItemResponse) => {
    const topPicks = homeData.sections?.find(
      (section) => section.layout === 'top_picks'
    )
    const result = topPicks && topPicks.items.length > 0
    return result
  }

  const shouldFallback =
    homeData.error || (!homeData.isValidating && !hasTopPicks(homeData))
  const searchData = useGetLibraryItems(
    'home',
    undefined,
    {
      limit: 10,
      searchQuery: 'in:inbox',
      includeContent: false,
      sortDescending: true,
    },
    // only enable this search if we didn't get home data
    shouldFallback
  )

  useApplyLocalTheme()

  const viewerUsername = useMemo(() => {
    return viewerData?.profile.username
  }, [viewerData])

  const searchItems = useMemo(() => {
    return []
    // return searchData.items.map((item) => {
    //   return {
    //     id: item.id,
    //     date: item.savedAt,
    //     title: item.title,
    //     url: item.url,
    //     slug: item.slug,
    //     score: 1.0,
    //     thumbnail: item.image,
    //     previewContent: item.description,
    //     source: {
    //       name: item.folder == 'following' ? item.subscription : item.siteName,
    //       icon: item.siteIcon,
    //       type: 'LIBRARY',
    //     },
    //     canArchive: true,
    //     canDelete: true,
    //     canShare: true,
    //     canMove: item.folder == 'following',
    //   } as HomeItem
    // })
  }, [searchData])

  useEffect(() => {
    window.localStorage.setItem('nav-return', router.asPath)
  }, [router.asPath])

  useEffect(() => {
    const newSections = homeData.sections
    if (
      homeData.sections &&
      JSON.stringify(newSections) !== JSON.stringify(state.serverHome)
    ) {
      dispatch({
        type: 'SET_HOME_ITEMS',
        payload: homeData.sections,
      })
    }
  }, [homeData, state.home, dispatch])

  useEffect(() => {
    if (
      searchItems &&
      searchItems.length > 0 &&
      JSON.stringify(searchItems) !== JSON.stringify(state.serverLibraryItems)
    ) {
      dispatch({
        type: 'SET_LIBRARY_ITEMS',
        payload: searchItems,
      })
    }
  }, [searchItems, state.libraryItems, dispatch])

  const moveSelectedItem = useCallback(
    (direction: 'next' | 'previous') => {
      const elements = document.querySelectorAll('[data-navigable]')
      // this is the old index, if its less than
      // the current length then its good because
      // the removed item will give
      let index = Array.from(elements).findIndex(
        (element) =>
          element.getAttribute('data-navigable') == state.selectedItem
      )

      if (direction == 'next') {
        index = index === -1 ? 0 : Math.min(index + 1, state.items.length - 1)
      } else if (direction == 'previous') {
        index = index === -1 ? 0 : Math.max(index - 1, 0)
      }

      const selected = state.items[index]
      if (state.selectedItem !== selected.id) {
        dispatch({
          type: 'SET_ACTIVE_ELEMENT',
          payload: selected.id,
        })
      }
    },
    [state, dispatch]
  )

  useEffect(() => {
    if (state.selectedItem) {
      const element = document.querySelector<HTMLElement>(
        `[data-navigable="${state.selectedItem}"]`
      )
      element?.focus()
      localStorage.setItem('activeElementId', state.selectedItem)
    }
  }, [state.selectedItem])

  useEffect(() => {
    const selectedItem = localStorage.getItem('activeElementId')
    console.log('loaded selected item: ', selectedItem)
    if (selectedItem) {
      dispatch({
        type: 'SET_ACTIVE_ELEMENT',
        payload: selectedItem,
      })
    }
  }, [])

  useRegisterActions(
    [
      {
        id: 'move_next',
        section: 'Items',
        name: 'Focus next item',
        shortcut: ['arrowdown'],
        keywords: 'move next',
        perform: () => {
          moveSelectedItem('next')
        },
      },
      {
        id: 'move_previous',
        section: 'Items',
        name: 'Focus previous item',
        shortcut: ['arrowup'],
        keywords: 'move previous',
        perform: () => {
          moveSelectedItem('previous')
        },
      },
      {
        id: 'move_next_vim',
        section: 'Items',
        name: 'Focus next item',
        shortcut: ['j'],
        keywords: 'move next',
        perform: () => {
          moveSelectedItem('next')
        },
      },
      {
        id: 'move_previous_vim',
        section: 'Items',
        name: 'Focus previous item',
        shortcut: ['k'],
        keywords: 'move previous',
        perform: () => {
          moveSelectedItem('previous')
        },
      },

      // {
      //   shortcutKeys: ['a'],
      //   actionDescription: 'Open Add Link dialog',
      //   shortcutKeyDescription: 'a',
      //   callback: () => actionHandler('showAddLinkModal'),
      // },
    ],
    [state.selectedItem, moveSelectedItem]
  )

  const dataReady =
    !homeData.isValidating && (!shouldFallback || !searchData.isLoading)
  if (!dataReady || (homeData.error && homeData.errorMessage == 'PENDING')) {
    console.log('showing pending')
    return (
      <VStack
        distribution="center"
        alignment="center"
        css={{
          width: '100%',
          bg: '$readerBg',
          minHeight: '100vh',
          minWidth: '320px',
        }}
      >
        <SyncLoader color={theme.colors.omnivoreGray.toString()} size={8} />
      </VStack>
    )
  }

  return (
    <NavigationContext.Provider value={{ state, dispatch }}>
      <VStack
        distribution="start"
        alignment="center"
        css={{
          width: '100%',
          bg: '$readerBg',
          pt: '45px',
          minHeight: '100vh',
          minWidth: '320px',
          '@mdDown': {
            pt: '0px',
            mt: '80px',
          },
        }}
      >
        <VStack
          distribution="start"
          css={{
            width: '680px',
            gap: '50px',
            minHeight: '100vh',
            '@lgDown': {
              gap: '40px',
              width: '80%',
            },
            '@mdDown': {
              width: '100%',
            },
          }}
        >
          {state.home?.map((homeSection, idx) => {
            switch (homeSection.layout) {
              case 'just_added':
                if (homeSection.items.length < 1) {
                  return <SpanBox key={`section-${idx}`}></SpanBox>
                }
                return (
                  <JustAddedHomeSection
                    key={`section-${idx}`}
                    homeSection={homeSection}
                    viewerUsername={viewerUsername}
                  />
                )
              case 'top_picks':
                return (
                  <TopPicksHomeSection
                    key={`section-${idx}`}
                    homeSection={homeSection}
                    viewerUsername={viewerUsername}
                  />
                )
              case 'quick_links':
                if (homeSection.items.length < 1) {
                  return <SpanBox key={`section-${idx}`}></SpanBox>
                }
                return (
                  <QuickLinksHomeSection
                    key={`section-${idx}`}
                    homeSection={homeSection}
                    viewerUsername={viewerUsername}
                  />
                )
              case 'hidden':
                if (homeSection.items.length < 1) {
                  return <SpanBox key={`section-${idx}`}></SpanBox>
                }
                return (
                  <HiddenHomeSection
                    key={`section-${idx}`}
                    homeSection={homeSection}
                    viewerUsername={viewerUsername}
                  />
                )
              default:
                console.log('unknown home section: ', homeSection)
                return <SpanBox key={`section-${idx}`}></SpanBox>
            }
          })}
        </VStack>
      </VStack>
    </NavigationContext.Provider>
  )
}

type HomeSectionProps = {
  homeSection: HomeSection
  viewerUsername: string | undefined
}

const JustAddedHomeSection = (props: HomeSectionProps): JSX.Element => {
  const router = useRouter()
  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
        height: '100%',
        gap: '20px',
      }}
    >
      <HStack
        css={{
          width: '100%',
          lineHeight: '1',
          '@mdDown': {
            px: '20px',
          },
        }}
        distribution="start"
        alignment="start"
      >
        <SpanBox
          css={{
            fontFamily: '$inter',
            fontSize: '16px',
            fontWeight: '600',
            color: '$homeTextTitle',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            display: '-webkit-box',
            '-webkit-line-clamp': '2',
            '-webkit-box-orient': 'vertical',
          }}
        >
          {props.homeSection.title}
        </SpanBox>
        <SpanBox
          css={{
            ml: 'auto',
            fontFamily: '$inter',
            fontSize: '13px',
            fontWeight: '400',
            color: '$homeTextTitle',
          }}
        >
          <Button
            style="link"
            onClick={(event) => {
              router.push('/library')
              event.preventDefault()
            }}
            css={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            View All
          </Button>
        </SpanBox>
      </HStack>
      <HStack
        css={{
          width: '100%',
          height: '100%',
          lineHeight: '1',
          overflowX: 'scroll',
          gap: '25px',
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': {
            display: 'none',
          },
          '@mdDown': {
            px: '20px',
          },
        }}
        distribution="start"
        alignment="start"
      >
        {props.homeSection.items.map((homeItem) => {
          return <JustAddedItemView key={homeItem.id} homeItem={homeItem} />
        })}
      </HStack>
    </VStack>
  )
}

const TopPicksHomeSection = (props: HomeSectionProps): JSX.Element => {
  const { state, dispatch } = useNavigation()

  const items = useMemo(() => {
    return (
      state.home?.find((section) => section.layout == 'top_picks')?.items ?? []
    )
  }, [props, state.home])

  if (items.length < 1) {
    return (
      <VStack
        distribution="start"
        css={{
          height: '540px',
          width: '100%',
          gap: '20px',
          '@mdDown': {
            gap: '10px',
          },
          bg: '$homeCardHover',
        }}
      >
        Your top picks are empty.
      </VStack>
    )
  }

  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
        gap: '20px',
        '@mdDown': {
          gap: '10px',
        },
      }}
    >
      {items.length > 0 && (
        <SpanBox
          css={{
            fontFamily: '$inter',
            fontSize: '16px',
            fontWeight: '600',
            color: '$homeTextTitle',
            '@mdDown': {
              px: '20px',
            },
          }}
        >
          {props.homeSection.title}
        </SpanBox>
      )}

      <Pagination
        items={items}
        itemsPerPage={10}
        loadMoreButtonText="Load more Top Picks"
        render={(homeItem) => (
          <TopPicksItemView key={homeItem.id} homeItem={homeItem} />
        )}
      />
    </VStack>
  )
}

const QuickLinksHomeSection = (props: HomeSectionProps): JSX.Element => {
  const { state } = useNavigation()
  const items = useMemo(() => {
    return (
      state.home?.find((section) => section.layout == 'quick_links')?.items ??
      []
    )
  }, [props, state.home])
  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
        gap: '10px',
        bg: '$homeCardHover',
        py: '20px',
        px: '20px',
        borderRadius: '5px',
      }}
    >
      <SpanBox
        css={{
          fontFamily: '$inter',
          fontSize: '12px',
          fontWeight: '500',
          textTransform: 'uppercase',
          color: '$ctaBlue',
          bg: '#007AFF20',
          px: '10px',
          py: '5px',
          borderRadius: '5px',
        }}
      >
        {props.homeSection.title}
      </SpanBox>

      <Pagination
        items={items}
        itemsPerPage={8}
        render={(homeItem) => (
          <QuickLinkHomeItemView key={homeItem.id} homeItem={homeItem} />
        )}
      />
    </VStack>
  )
}

const HiddenHomeSection = (props: HomeSectionProps): JSX.Element => {
  const [isHidden, setIsHidden] = useState(true)
  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
        gap: '20px',
        marginBottom: '40px',
      }}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{
          gap: '10px',
          cursor: 'pointer',
        }}
        onClick={() => setIsHidden(!isHidden)}
      >
        <SpanBox
          css={{
            fontFamily: '$inter',
            fontSize: '16px',
            fontWeight: '600',
            color: '$homeTextTitle',
          }}
        >
          {props.homeSection.title}
        </SpanBox>
        <SpanBox
          css={{
            fontFamily: '$inter',
            fontSize: '13px',
            color: '$readerFont',
          }}
        >
          {isHidden ? 'Show' : 'Hide'}
        </SpanBox>
      </HStack>

      {isHidden ? <></> : <HiddenHomeSectionView />}
    </VStack>
  )
}

const HiddenHomeSectionView = (): JSX.Element => {
  const hiddenSectionData = useGetHiddenHomeSection()

  if (hiddenSectionData.error) {
    return <SpanBox>Error loading hidden section</SpanBox>
  }

  if (hiddenSectionData.isValidating) {
    return <SpanBox>Loading...</SpanBox>
  }

  if (!hiddenSectionData.section) {
    return <SpanBox>No hidden section data</SpanBox>
  }

  return (
    <VStack
      distribution="start"
      css={{
        width: '100%',
      }}
    >
      {hiddenSectionData.section.items.map((homeItem) => {
        return <QuickLinkHomeItemView key={homeItem.id} homeItem={homeItem} />
      })}
    </VStack>
  )
}

const CoverImage = styled('img', {
  objectFit: 'cover',
})

type HomeItemViewProps = {
  homeItem: HomeItem
  viewerUsername?: string | undefined
}

const TimeAgo = (props: HomeItemViewProps): JSX.Element => {
  return (
    <HStack
      distribution="start"
      alignment="center"
      css={{
        fontSize: '12px',
        fontWeight: 'medium',
        fontFamily: '$inter',
        color: '$homeTextSubtle',
        flexShrink: '0',
      }}
    >
      {timeAgo(props.homeItem.date)}
    </HStack>
  )
}

const Title = (props: HomeItemViewProps): JSX.Element => {
  return (
    <HStack
      className="title-text"
      distribution="start"
      alignment="center"
      css={{
        mb: '6px',
        fontSize: '18px',
        lineHeight: '24px',
        fontWeight: '600',
        fontFamily: '$inter',
        color: '$homeTextTitle',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-line-clamp': '3',
        '-webkit-box-orient': 'vertical',
        '&:title-text': {
          transition: 'text-decoration 0.3s ease',
        },
        '@mdDown': {
          fontSize: '16px',
          lineHeight: '20px',
        },
      }}
    >
      {props.homeItem.title}
    </HStack>
  )
}

type TitleSmallProps = {
  maxLines?: string
}

const TitleSmall = (
  props: HomeItemViewProps & TitleSmallProps
): JSX.Element => {
  return (
    <HStack
      className="title-text"
      distribution="start"
      alignment="center"
      css={{
        fontSize: '14px',
        lineHeight: '21px',
        minHeight: '42px', // always have two lines of space
        fontWeight: '500',
        fontFamily: '$inter',
        color: '$homeTextTitle',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-line-clamp': props.maxLines ?? '3',
        '-webkit-box-orient': 'vertical',
      }}
    >
      {props.homeItem.title}
    </HStack>
  )
}

type PreviewContentProps = {
  previewContent?: string
  maxLines?: string
}

const PreviewContent = (props: PreviewContentProps): JSX.Element => {
  return (
    <SpanBox
      css={{
        fontFamily: '$inter',
        fontSize: '14px',
        lineHeight: '21px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-line-clamp': props.maxLines ?? '3',
        '-webkit-box-orient': 'vertical',
        '@mdDown': {
          '-webkit-line-clamp': '3',
        },
      }}
    >
      {props.previewContent ?? ''}
    </SpanBox>
  )
}

const JustAddedItemView = (props: HomeItemViewProps): JSX.Element => {
  const router = useRouter()

  return (
    <VStack
      css={{
        minWidth: '377px',
        gap: '5px',
        padding: '12px',
        cursor: 'pointer',
        bg: '$homeCardHover',
        borderRadius: '5px',
        '&:hover': {
          bg: '#007AFF10',
        },
        '&:hover .title-text': {
          textDecoration: 'underline',
        },
        '@mdDown': {
          minWidth: '282px',
        },
      }}
      onClick={(event) => {
        const path = `/${props.viewerUsername ?? 'me'}/${props.homeItem.slug}`
        if (event.metaKey || event.ctrlKey) {
          window.open(path, '_blank')
        } else {
          router.push(path)
        }
      }}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ width: '100%', gap: '5px', lineHeight: '1' }}
      >
        <SourceInfo homeItem={props.homeItem} subtle={true} />
        <SpanBox css={{ ml: 'auto', flexShrink: '0' }}>
          <TimeAgo homeItem={props.homeItem} />
        </SpanBox>
      </HStack>

      <TitleSmall homeItem={props.homeItem} maxLines="2" />
    </VStack>
  )
}

const TopPicksItemView = (props: HomeItemViewProps): JSX.Element => {
  const router = useRouter()
  const { dispatch } = useNavigation()
  const { archiveItem, deleteItem, moveItem, shareItem } =
    useLibraryItemActions()

  const doArchiveItem = useCallback(
    async (libraryItemId: string, slug: string) => {
      dispatch({
        type: 'REMOVE_ITEM',
        payload: libraryItemId,
      })
      if (!(await archiveItem(libraryItemId, slug))) {
        // dispatch({
        //   type: 'REPLACE_ITEM',
        //   itemId: libraryItemId,
        // })
      }
    },
    [archiveItem]
  )

  const doDeleteItem = useCallback(
    async (libraryItemId: string, slug: string) => {
      dispatch({
        type: 'REMOVE_ITEM',
        payload: libraryItemId,
      })
      const undo = () => {
        // props.dispatch({
        //   type: 'REPLACE_ITEM',
        //   : libraryItemId,
        // })
      }
      if (!(await deleteItem(libraryItemId, slug, undo))) {
        // dispatch({
        //   type: 'REPLACE_ITEM',
        //   payload: libraryItemId,
        // })
      }
    },
    [deleteItem]
  )

  const doMoveItem = useCallback(
    async (libraryItemId: string, slug: string) => {
      dispatch({
        type: 'REMOVE_ITEM',
        payload: libraryItemId,
      })
      if (!(await moveItem(libraryItemId, slug))) {
        // dispatch({
        //   type: 'REPLACE_ITEM',
        //   payload: libraryItemId,
        // })
      }
    },
    [moveItem]
  )

  return (
    <VStack
      tabIndex={0}
      data-navigable={props.homeItem.id}
      css={{
        width: '100%',
        pt: '15px',
        cursor: 'pointer',
        borderRadius: '5px',
        '@mdDown': {
          borderRadius: '0px',
        },
        '&:focus-visible': {
          outline: 'none',
          bg: '$homeCardHover',
        },
        '&:focus-visible .title-text': {
          textDecoration: 'underline',
        },
        '&:hover': {
          bg: '$homeCardHover',
        },
        '&:hover .title-text': {
          textDecoration: 'underline',
        },
      }}
      onClick={(event) => {
        const path = `/${props.viewerUsername ?? 'me'}/${props.homeItem.slug}`
        if (event.metaKey || event.ctrlKey) {
          window.open(path, '_blank')
        } else {
          router.push(path)
        }
      }}
      onKeyDown={(event) => {
        switch (event.key.toLowerCase()) {
          case 'enter':
            ;(event.target as HTMLElement).click()
            break
          case 'e':
            doArchiveItem(props.homeItem.id, props.homeItem.slug)
            break
          case '#':
            doDeleteItem(props.homeItem.id, props.homeItem.slug)
            break
          case 'm':
            doMoveItem(props.homeItem.id, props.homeItem.slug)
            break
          case 'o':
            window.open(props.homeItem.url, '_blank')
            break
        }
      }}
      alignment="start"
    >
      <Box css={{ width: '100%', gap: '10px', px: '20px' }}>
        <HStack
          distribution="start"
          alignment="center"
          css={{ gap: '5px', lineHeight: '1', mb: '10px' }}
        >
          <SourceInfo homeItem={props.homeItem} />
          <SpanBox css={{ '@mdDown': { ml: 'auto' } }}>
            <TimeAgo homeItem={props.homeItem} />
          </SpanBox>
        </HStack>

        {props.homeItem.thumbnail && (
          <CoverImage
            css={{
              width: '120px',
              height: '70px',
              borderRadius: '4px',
              marginLeft: '10px',
              float: 'right',
            }}
            src={props.homeItem.thumbnail}
          ></CoverImage>
        )}
        <Title homeItem={props.homeItem} />
        <PreviewContent
          previewContent={props.homeItem.previewContent}
          maxLines="6"
        />
      </Box>
      <SpanBox css={{ px: '20px' }}></SpanBox>
      <HStack css={{ gap: '10px', my: '15px', px: '20px' }}>
        {props.homeItem.canMove && (
          <Button
            title="Add to library"
            style="homeAction"
            onClick={async (event) => {
              event.preventDefault()
              event.stopPropagation()
              await doMoveItem(props.homeItem.id, props.homeItem.slug)
            }}
          >
            <AddToLibraryActionIcon />
          </Button>
        )}
        {props.homeItem.canArchive && (
          <Button
            title="Archive"
            style="homeAction"
            onClick={async (event) => {
              event.preventDefault()
              event.stopPropagation()
              await doArchiveItem(props.homeItem.id, props.homeItem.slug)
            }}
          >
            <ArchiveActionIcon />
          </Button>
        )}
        {props.homeItem.canDelete && (
          <Button
            title="Delete"
            style="homeAction"
            onClick={async (event) => {
              event.preventDefault()
              event.stopPropagation()
              await doDeleteItem(props.homeItem.id, props.homeItem.slug)
            }}
          >
            <RemoveActionIcon />
          </Button>
        )}
        {props.homeItem.canShare && (
          <Button
            title="Share original"
            style="homeAction"
            onClick={async (event) => {
              event.preventDefault()
              event.stopPropagation()
              await shareItem(props.homeItem.title, props.homeItem.url)
            }}
          >
            <ShareActionIcon />
          </Button>
        )}
      </HStack>
      <Box
        css={{ mt: '15px', width: '100%', height: '1px', bg: '$homeDivider' }}
      />
    </VStack>
  )
}

const QuickLinkHomeItemView = (props: HomeItemViewProps): JSX.Element => {
  const router = useRouter()

  return (
    <VStack
      data-navigable={props.homeItem.id}
      css={{
        mt: '10px',
        width: '100%',
        px: '10px',
        py: '10px',
        gap: '5px',
        borderRadius: '5px',
        '&:hover': {
          bg: '#007AFF10',
          cursor: 'pointer',
        },
        '&:hover .title-text': {
          textDecoration: 'underline',
        },
      }}
      onClick={(event) => {
        const path = `/${props.viewerUsername ?? 'me'}/${props.homeItem.slug}`
        if (event.metaKey || event.ctrlKey) {
          window.open(path, '_blank')
        } else {
          router.push(path)
        }
      }}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ width: '100%', gap: '5px', lineHeight: '1' }}
      >
        <SourceInfo homeItem={props.homeItem} subtle={true} />

        <SpanBox css={{ ml: 'auto', flexShrink: '0' }}>
          <TimeAgo homeItem={props.homeItem} />
        </SpanBox>
      </HStack>
      <Title homeItem={props.homeItem} />
      <PreviewContent
        previewContent={props.homeItem.previewContent}
        maxLines="2"
      />
    </VStack>
  )
}

const SiteIconSmall = styled('img', {
  width: '16px',
  height: '16px',
  borderRadius: '100px',
})

const SiteIconLarge = styled('img', {
  width: '25px',
  height: '25px',
  borderRadius: '100px',
})

type SourceInfoProps = {
  subtle?: boolean
}

const SourceInfo = (props: HomeItemViewProps & SourceInfoProps) => {
  const hasHover = useMemo(() => {
    const type = props.homeItem.source.type
    return type == 'RSS' || type == 'NEWSLETTER'
  }, [props])
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <HStack
          distribution="start"
          alignment="center"
          css={{
            gap: '8px',
            height: '16px',
            cursor: 'pointer',
            flex: '1',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {props.homeItem.source.icon && (
            <SiteIconSmall src={props.homeItem.source.icon} />
          )}
          <HStack
            css={{
              lineHeight: '1',
              fontFamily: '$inter',
              fontWeight: '500',
              fontSize: props.subtle ? '12px' : '13px',
              color: props.subtle ? '$homeTextSubtle' : '$homeTextSource',
              textDecoration: hasHover ? 'underline' : 'unset',
            }}
          >
            {props.homeItem.source.name}
          </HStack>
        </HStack>
      </HoverCard.Trigger>
      {hasHover && (
        <HoverCard.Portal>
          <HoverCard.Content sideOffset={5} style={{ zIndex: 5 }}>
            <SubscriptionSourceHoverContent source={props.homeItem.source} />
            <HoverCard.Arrow fill={theme.colors.thBackground2.toString()} />
          </HoverCard.Content>
        </HoverCard.Portal>
      )}
    </HoverCard.Root>
  )
}

type SourceHoverContentProps = {
  source: HomeItemSource
}

const SubscriptionSourceHoverContent = (
  props: SourceHoverContentProps
): JSX.Element => {
  const mapSourceType = (
    sourceType: HomeItemSourceType
  ): SubscriptionType | undefined => {
    switch (sourceType) {
      case 'RSS':
      case 'NEWSLETTER':
        return sourceType as SubscriptionType
      default:
        return undefined
    }
  }
  const { subscriptions, isValidating } = useGetSubscriptionsQuery(
    mapSourceType(props.source.type)
  )
  const subscription = useMemo(() => {
    if (props.source.id && subscriptions) {
      return subscriptions.find((sub) => sub.id == props.source.id)
    }
    return undefined
  }, [subscriptions])

  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{
        width: '380px',
        height: '200px',
        bg: '$thBackground2',
        borderRadius: '10px',
        padding: '15px',
        gap: '10px',
        boxShadow: theme.shadows.cardBoxShadow.toString(),
      }}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ width: '100%', gap: '10px', height: '35px' }}
      >
        {props.source.icon && <SiteIconLarge src={props.source.icon} />}
        <SpanBox
          css={{
            fontFamily: '$inter',
            fontWeight: '500',
            fontSize: '14px',
          }}
        >
          {props.source.name}
        </SpanBox>
        <SpanBox css={{ ml: 'auto', minWidth: '100px' }}>
          {subscription && subscription.status == 'ACTIVE' && (
            <Button style="ctaSubtle" css={{ fontSize: '12px' }}>
              Unsubscribe
            </Button>
          )}
        </SpanBox>
      </HStack>
      <SpanBox
        css={{
          fontFamily: '$inter',
          fontSize: '13px',
          color: '$homeTextBody',
        }}
      >
        {subscription ? <>{subscription.description}</> : <></>}
      </SpanBox>
    </VStack>
  )
}
