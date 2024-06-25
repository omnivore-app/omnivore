import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { Circle, DotsThree, MagnifyingGlass, X } from '@phosphor-icons/react'
import {
  Subscription,
  SubscriptionType,
  useGetSubscriptionsQuery,
} from '../../../lib/networking/queries/useGetSubscriptionsQuery'
import { useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { theme } from '../../tokens/stitches.config'
import { useRegisterActions } from 'kbar'
import { LogoBox } from '../../elements/LogoBox'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { useGetSavedSearchQuery } from '../../../lib/networking/queries/useGetSavedSearchQuery'
import { SavedSearch } from '../../../lib/networking/fragments/savedSearchFragment'
import { ToggleCaretDownIcon } from '../../elements/icons/ToggleCaretDownIcon'
import Link from 'next/link'
import { ToggleCaretRightIcon } from '../../elements/icons/ToggleCaretRightIcon'
import { NavMenuFooter } from './Footer'
import { FollowingIcon } from '../../elements/icons/FollowingIcon'
import { HomeIcon } from '../../elements/icons/HomeIcon'
import { LibraryIcon } from '../../elements/icons/LibraryIcon'
import { HighlightsIcon } from '../../elements/icons/HighlightsIcon'
import { CoverImage } from '../../elements/CoverImage'
import { Shortcut } from './NavigationMenu'
import { OutlinedLabelChip } from '../../elements/OutlinedLabelChip'
import { NewsletterIcon } from '../../elements/icons/NewsletterIcon'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { useRouter } from 'next/router'
import { DiscoverIcon } from '../../elements/icons/DiscoverIcon'
import { escapeQuotes } from '../../../utils/helper'

export const LIBRARY_LEFT_MENU_WIDTH = '275px'

type LibraryFilterMenuProps = {
  setShowAddLinkModal: (show: boolean) => void

  searchTerm: string | undefined
  applySearchQuery: (searchTerm: string) => void

  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void
}

export function LibraryFilterMenu(props: LibraryFilterMenuProps): JSX.Element {
  return (
    <>
      <Box
        css={{
          left: '0px',
          top: '0px',
          position: 'fixed',
          bg: '$thLeftMenuBackground',
          height: '100%',
          width: LIBRARY_LEFT_MENU_WIDTH,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '@mdDown': {
            width: '100%',
            transition: 'top 100ms, visibility 100ms',
            top: props.showFilterMenu ? '0' : '100%',
            visibility: props.showFilterMenu ? 'visible' : 'hidden',
          },
          zIndex: 10,
        }}
      >
        <Box
          css={{
            width: '100%',
            px: '25px',
            pb: '17px',
            pt: '4.5px',
            lineHeight: '1',
            '@mdDown': {
              pb: '0px',
              pt: '5px',
              px: '15px',
            },
          }}
        >
          <SpanBox css={{ '@mdDown': { display: 'none' } }}>
            <LogoBox />
          </SpanBox>

          <Button
            style="plainIcon"
            css={{
              display: 'none',
              '@mdDown': {
                display: 'flex',
                ml: 'auto',
                pt: '10px',
                pb: '0px',
              },
            }}
            onClick={(event) => {
              props.setShowFilterMenu(false)
              event.preventDefault()
            }}
          >
            <X size={30} />
          </Button>
        </Box>
        <LibraryNav {...props} />
        <Shortcuts {...props} />
        <NavMenuFooter {...props} />
        <Box css={{ height: '250px ' }} />
      </Box>
      {/* This spacer pushes library content to the right of 
      the fixed left side menu. */}
      <Box
        css={{
          minWidth: LIBRARY_LEFT_MENU_WIDTH,
          height: '100%',
          bg: '$thBackground',
          '@mdDown': {
            display: 'none',
          },
        }}
      ></Box>
    </>
  )
}

const LibraryNav = (props: LibraryFilterMenuProps): JSX.Element => {
  return (
    <VStack
      css={{
        m: '0px',
        mt: '10px',
        gap: '5px',
        width: '100%',
        borderBottom: '1px solid $thBorderColor',
        px: '15px',
        pb: '25px',
      }}
      alignment="start"
      distribution="start"
    >
      <NavButton
        {...props}
        text="Home"
        filterTerm="in:library OR in:following use:folders"
        icon={<HomeIcon color={theme.colors.thHomeIcon.toString()} />}
      />
      <NavButton
        {...props}
        text="Following"
        filterTerm="in:following use:folders"
        icon={<FollowingIcon color="#F59932" />}
      />
      <NavButton
        {...props}
        text="Library"
        filterTerm="in:library use:folders"
        icon={<LibraryIcon color={theme.colors.ctaBlue.toString()} />}
      />
      <NavRedirectButton
        {...props}
        text="Highlights"
        redirectLocation={'/highlights'}
        icon={<HighlightsIcon color={theme.colors.highlight.toString()} />}
      />
      <NavRedirectButton
        {...props}
        text="Discover"
        redirectLocation={'/discover'}
        icon={<DiscoverIcon color={theme.colors.discover.toString()} />}
      />
    </VStack>
  )
}

const Shortcuts = (props: LibraryFilterMenuProps): JSX.Element => {
  const router = useRouter()
  const [shortcuts] = usePersistedState<Shortcut[]>({
    key: 'library-shortcuts',
    isSessionStorage: false,
    initialValue: [],
  })

  console.log('got shortcuts: ', shortcuts)

  // const shortcuts: Shortcut[] = [
  //   {
  //     id: '12asdfasdf',
  //     name: 'Omnivore Blog',
  //     icon: 'https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F052c15c4-ecfd-4d32-87db-13bcac9afad5_512x512.png',
  //     filter: 'subscription:"Money Talk"',
  //     type: 'feed',
  //   },
  //   {
  //     id: 'sdfsdfgdsfg',
  //     name: 'Follow the Money | Arne & Harr',
  //     filter: 'subscription:"Money Talk"',
  //     type: 'feed',
  //   },
  //   {
  //     id: 'sdfasdfasdfsdfsdfsgasdfg',
  //     name: 'Andrew Kenneson from Center for the Study of Partisanship and Ideology',
  //     // icon: 'https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F052c15c4-ecfd-4d32-87db-13bcac9afad5_512x512.png',
  //     filter: 'in:all label:"Hockey"',
  //     type: 'newsletter',
  //   },
  //   {
  //     id: 'sdfasdfasdfsdfsdfsgasdfg',
  //     name: 'Robert的博客',
  //     // icon: 'https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F052c15c4-ecfd-4d32-87db-13bcac9afad5_512x512.png',
  //     filter: 'in:all label:"Hockey"',
  //     type: 'feed',
  //   },
  //   {
  //     id: 'sdfasdfasdfasdfasf',
  //     name: 'Oldest First',
  //     // icon: 'https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F052c15c4-ecfd-4d32-87db-13bcac9afad5_512x512.png',
  //     filter: 'in:all label:"Hockey"',
  //     type: 'search',
  //   },
  //   {
  //     id: 'sdfasdfasdfgasdfg',
  //     name: 'Hockey',
  //     // icon: 'https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F052c15c4-ecfd-4d32-87db-13bcac9afad5_512x512.png',
  //     filter: 'in:all label:"Hockey"',
  //     type: 'label',
  //     label: {
  //       id: 'sdfsdfsdf',
  //       name: 'Hockey',
  //       color: '#E98B8B',
  //       createdAt: new Date(),
  //     },
  //   },
  // ]
  //

  return (
    <VStack
      css={{
        m: '0px',
        gap: '8px',
        width: '100%',
        px: '15px',
        pb: '25px',
      }}
      alignment="start"
      distribution="start"
    >
      <HStack
        alignment="center"
        distribution="start"
        css={{ width: '100%', pr: '0px' }}
      >
        <StyledText
          css={{
            fontFamily: '$display',
            fontSize: '14px',
            lineHeight: '125%',
            color: '$thLibraryMenuPrimary',
            pl: '10px',
            // mt: '20px',
            mb: '10px',
          }}
        >
          SHORTCUTS
        </StyledText>
        <SpanBox css={{ display: 'flex', ml: 'auto' }}>
          <Dropdown
            side="bottom"
            triggerElement={<DotsThree size={20} />}
            css={{ ml: 'auto' }}
          >
            <DropdownOption
              onSelect={() => {
                router.push(`/settings/shortcuts`)
              }}
              title="Edit shortcuts"
            />
          </Dropdown>
        </SpanBox>
      </HStack>
      {shortcuts.map((shortcut) => {
        const selected = props.searchTerm === shortcut.filter
        return (
          <Box
            key={`shortcut-${shortcut.id}`}
            css={{
              display: 'flex',
              width: '100%',
              maxWidth: '100%',
              height: '32px',

              backgroundColor: selected ? '$thLibrarySelectionColor' : 'unset',
              color: selected
                ? '$thLibraryMenuSecondary'
                : '$thLibraryMenuUnselected',
              verticalAlign: 'middle',
              borderRadius: '3px',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: selected
                  ? '$thLibrarySelectionColor'
                  : '$thBackground4',
              },
              '&:active': {
                backgroundColor: selected
                  ? '$thLibrarySelectionColor'
                  : '$thBackground4',
              },
            }}
            title={shortcut.name}
            onClick={(e) => {
              props.applySearchQuery(shortcut.filter)
              props.setShowFilterMenu(false)
              e.preventDefault()
            }}
          >
            {(shortcut.type == 'feed' || shortcut.type == 'newsletter') && (
              <FeedOrNewsletterShortcut shortcut={shortcut} />
            )}
            {shortcut.type == 'search' && (
              <SearchShortcut shortcut={shortcut} />
            )}
            {shortcut.type == 'label' && <LabelShortcut shortcut={shortcut} />}
          </Box>
        )
      })}
    </VStack>
  )
}

type ShortcutItemProps = {
  shortcut: Shortcut
}

const FeedOrNewsletterShortcut = (props: ShortcutItemProps): JSX.Element => {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{ pl: '10px', width: '100%', gap: '10px' }}
      key={`search-${props.shortcut.id}`}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ minWidth: '20px' }}
      >
        {props.shortcut.icon ? (
          <CoverImage
            src={props.shortcut.icon}
            width={20}
            height={20}
            css={{ borderRadius: '20px' }}
          />
        ) : props.shortcut.type == 'newsletter' ? (
          <NewsletterIcon color="#F59932" size={18} />
        ) : (
          <FollowingIcon color="#F59932" size={21} />
        )}
      </HStack>
      <StyledText style="settingsItem">{props.shortcut.name}</StyledText>
    </HStack>
  )
}

const SearchShortcut = (props: ShortcutItemProps): JSX.Element => {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{ pl: '10px', width: '100%', gap: '10px' }}
      key={`search-${props.shortcut.id}`}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ minWidth: '20px' }}
      >
        <MagnifyingGlass size={18} />
      </HStack>
      <StyledText style="settingsItem">{props.shortcut.name}</StyledText>
    </HStack>
  )
}

const LabelShortcut = (props: ShortcutItemProps): JSX.Element => {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{ pl: '5px', width: '100%' }}
      key={`search-${props.shortcut.id}`}
    >
      <OutlinedLabelChip
        text={props.shortcut.name}
        color={props.shortcut.label?.color ?? 'gray'}
      />
    </HStack>
  )
}

function SavedSearches(
  props: LibraryFilterMenuProps & { savedSearches: SavedSearch[] | undefined }
): JSX.Element {
  const sortedSearches = useMemo(() => {
    return props.savedSearches
      ?.filter((it) => it.visible)
      ?.sort(
        (left: SavedSearch, right: SavedSearch) =>
          left.position - right.position
      )
  }, [props.savedSearches])

  useRegisterActions(
    (sortedSearches ?? []).map((item, idx) => {
      const key = String(idx + 1)
      return {
        id: `saved_search_${key}`,
        name: item.name,
        shortcut: [key],
        section: 'Saved Searches',
        keywords: '?' + item.name,
        perform: () => {
          props.applySearchQuery(item.filter)
        },
      }
    }),
    [props.savedSearches]
  )

  const [collapsed, setCollapsed] = usePersistedState<boolean>({
    key: `--saved-searches-collapsed`,
    initialValue: false,
  })

  return (
    <MenuPanel
      title="SHORTCUTS"
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      {!collapsed &&
        sortedSearches &&
        sortedSearches?.map((item) => (
          <FilterButton
            key={item.name}
            text={item.name}
            filterTerm={item.filter}
            {...props}
          />
        ))}
      {!collapsed && sortedSearches !== undefined && (
        <EditButton
          title="Edit Saved Searches"
          destination="/settings/saved-searches"
        />
      )}

      <Box css={{ height: '10px' }}></Box>
    </MenuPanel>
  )
}

function Subscriptions(
  props: LibraryFilterMenuProps & { subscriptions: Subscription[] | undefined }
): JSX.Element {
  const [collapsed, setCollapsed] = usePersistedState<boolean>({
    key: `--subscriptions-collapsed`,
    initialValue: false,
  })

  const sortedSubscriptions = useMemo(() => {
    if (!props.subscriptions) {
      return []
    }
    return props.subscriptions
      .filter((s) => s.status == 'ACTIVE')
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [props.subscriptions])

  useRegisterActions(
    (sortedSubscriptions ?? []).map((subscription, idx) => {
      const key = String(idx + 1)
      const name = subscription.name
      return {
        id: `subscription_${key}`,
        section: 'Subscriptions',
        name: name,
        keywords: '*' + name,
        perform: () => {
          props.applySearchQuery(`subscription:\"${escapeQuotes(name)}\"`)
        },
      }
    }),
    [sortedSubscriptions]
  )

  return (
    <MenuPanel
      title="Subscriptions"
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      {!collapsed ? (
        <>
          <FilterButton
            filterTerm="in:inbox has:subscriptions"
            text="All"
            {...props}
          />
          <FilterButton
            filterTerm={`in:inbox label:RSS`}
            text="Feeds"
            {...props}
          />
          <FilterButton
            filterTerm={`in:inbox label:Newsletter`}
            text="Newsletters"
            {...props}
          />
          {(sortedSubscriptions ?? []).map((item) => {
            switch (item.type) {
              case SubscriptionType.NEWSLETTER:
                return (
                  <FilterButton
                    key={item.id}
                    filterTerm={`in:inbox subscription:\"${escapeQuotes(
                      item.name
                    )}\"`}
                    text={item.name}
                    {...props}
                  />
                )
              case SubscriptionType.RSS:
                return (
                  <FilterButton
                    key={item.id}
                    filterTerm={`in:inbox rss:\"${item.url}\"`}
                    text={item.name}
                    {...props}
                  />
                )
            }
          })}
          <EditButton
            title="Edit Subscriptions"
            destination="/settings/subscriptions"
          />
        </>
      ) : (
        <SpanBox css={{ mb: '10px' }} />
      )}
    </MenuPanel>
  )
}

function Labels(
  props: LibraryFilterMenuProps & { labels: Label[] }
): JSX.Element {
  const [collapsed, setCollapsed] = usePersistedState<boolean>({
    key: `--labels-collapsed`,
    initialValue: false,
  })

  const sortedLabels = useMemo(() => {
    return props.labels.sort((left: Label, right: Label) =>
      left.name.localeCompare(right.name)
    )
  }, [props.labels])

  return (
    <MenuPanel
      title="Labels"
      editTitle="Edit Labels"
      hideBottomBorder={true}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      {!collapsed && (
        <>
          {sortedLabels.map((item) => {
            return <LabelButton key={item.id} label={item} {...props} />
          })}
          <EditButton title="Edit Labels" destination="/settings/labels" />
        </>
      )}
    </MenuPanel>
  )
}

type MenuPanelProps = {
  title: string
  children: ReactNode
  editFunc?: () => void
  editTitle?: string
  hideBottomBorder?: boolean
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

function MenuPanel(props: MenuPanelProps): JSX.Element {
  return (
    <VStack
      css={{
        m: '0px',
        width: '100%',
        borderBottom: props.hideBottomBorder
          ? '1px solid transparent'
          : '1px solid $thBorderColor',
        px: '15px',
      }}
      alignment="start"
      distribution="start"
    >
      <HStack css={{ width: '100%' }} distribution="start" alignment="center">
        <StyledText
          css={{
            fontFamily: '$display',
            fontSize: '14px',
            lineHeight: '125%',
            color: '$thLibraryMenuPrimary',
            pl: '10px',
            mt: '20px',
            mb: '10px',
          }}
        >
          {props.title}
        </StyledText>
        <SpanBox
          css={{
            display: 'flex',
            height: '100%',
            mt: '10px',
            marginLeft: 'auto',
            verticalAlign: 'middle',
          }}
        >
          <Button
            style="articleActionIcon"
            onClick={(event) => {
              props.setCollapsed(!props.collapsed)
              event.preventDefault()
            }}
          >
            {props.collapsed ? (
              <ToggleCaretRightIcon
                size={15}
                color={theme.colors.thLibraryMenuPrimary.toString()}
              />
            ) : (
              <ToggleCaretDownIcon
                size={15}
                color={theme.colors.thLibraryMenuPrimary.toString()}
              />
            )}
          </Button>
        </SpanBox>
      </HStack>
      {props.children}
    </VStack>
  )
}

type NavButtonProps = {
  text: string
  icon: ReactNode

  filterTerm: string
  searchTerm: string | undefined

  applySearchQuery: (searchTerm: string) => void
  setShowFilterMenu: (show: boolean) => void
}

type NavButtonRedirectProps = {
  text: string
  icon: ReactNode

  redirectLocation: string
}

function NavRedirectButton(props: NavButtonRedirectProps): JSX.Element {
  const [selected, setSelected] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setSelected(window.location.pathname.includes(props.redirectLocation))
  }, [])

  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        pl: '10px',
        mb: '2px',
        gap: '10px',
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        height: '34px',

        backgroundColor: selected ? '$thLibrarySelectionColor' : 'unset',
        fontSize: '15px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: selected
          ? '$thLibraryMenuSecondary'
          : '$thLibraryMenuUnselected',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&:hover': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
        '&:active': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
      }}
      title={props.text}
      onClick={(e) => {
        router.push(props.redirectLocation)
        e.preventDefault()
      }}
    >
      {props.icon}
      {props.text}
    </HStack>
  )
}

function NavButton(props: NavButtonProps): JSX.Element {
  const isInboxFilter = (filter: string) => {
    return filter === '' || filter === 'in:inbox'
  }
  const selected = useMemo(() => {
    if (isInboxFilter(props.filterTerm) && !props.searchTerm) {
      return true
    }
    return props.searchTerm === props.filterTerm
  }, [props.searchTerm, props.filterTerm])

  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        pl: '10px',
        mb: '2px',
        gap: '10px',
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        height: '34px',

        backgroundColor: selected ? '$thLibrarySelectionColor' : 'unset',
        fontSize: '15px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: selected
          ? '$thLibraryMenuSecondary'
          : '$thLibraryMenuUnselected',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&:hover': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
        '&:active': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
      }}
      title={props.text}
      onClick={(e) => {
        props.applySearchQuery(props.filterTerm)
        props.setShowFilterMenu(false)
        e.preventDefault()
      }}
    >
      {props.icon}
      {props.text}
    </HStack>
  )
}

type FilterButtonProps = {
  text: string

  filterTerm: string
  searchTerm: string | undefined

  applySearchQuery: (searchTerm: string) => void

  setShowFilterMenu: (show: boolean) => void
}

function FilterButton(props: FilterButtonProps): JSX.Element {
  const isInboxFilter = (filter: string) => {
    return filter === '' || filter === 'in:inbox'
  }
  const selected = useMemo(() => {
    if (isInboxFilter(props.filterTerm) && !props.searchTerm) {
      return true
    }
    return props.searchTerm === props.filterTerm
  }, [props.searchTerm, props.filterTerm])

  return (
    <Box
      css={{
        pl: '10px',
        mb: '2px',
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        height: '32px',

        backgroundColor: selected ? '$thLibrarySelectionColor' : 'unset',
        fontSize: '14px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: selected
          ? '$thLibraryMenuSecondary'
          : '$thLibraryMenuUnselected',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        '&:hover': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
        '&:active': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
      }}
      title={props.text}
      onClick={(e) => {
        props.applySearchQuery(props.filterTerm)
        props.setShowFilterMenu(false)
        e.preventDefault()
      }}
    >
      {props.text}
    </Box>
  )
}

type LabelButtonProps = {
  label: Label
  searchTerm: string | undefined
  applySearchQuery: (searchTerm: string) => void
}

function LabelButton(props: LabelButtonProps): JSX.Element {
  const labelId = `checkbox-label-${props.label.id}`
  const checkboxRef = useRef<HTMLInputElement | null>(null)
  const state = useMemo(() => {
    const term = props.searchTerm ?? ''
    if (term.indexOf(`label:\"${escapeQuotes(props.label.name)}\"`) >= 0) {
      return 'on'
    }
    return 'off'
  }, [props.searchTerm, props.label])

  return (
    <HStack
      css={{
        pl: '10px',
        pt: '2px', // TODO: hack to middle align
        width: '100%',
        height: '30px',

        fontSize: '14px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color:
          state == 'on'
            ? '$thLibraryMenuSecondary'
            : '$thLibraryMenuUnselected',

        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',

        m: '0px',
        '&:hover': {
          backgroundColor: '$thBackground4',
        },
      }}
      title={props.label.name}
      alignment="center"
      distribution="start"
    >
      <label
        style={{
          cursor: 'pointer',
          width: '100%',
          maxWidth: '170px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        onClick={() => {
          const query = props.searchTerm?.replace(/label:\"(.*)\"/, '') ?? ''
          if (checkboxRef.current?.checked) {
            props.applySearchQuery(query.trim())
          } else {
            props.applySearchQuery(
              `${query.trim()} label:\"${escapeQuotes(props.label.name)}\"`
            )
          }
        }}
      >
        <Circle size={9} color={props.label.color} weight="fill" />
        <SpanBox css={{ pl: '10px' }}>{props.label.name}</SpanBox>
      </label>
      <SpanBox
        css={{
          ml: 'auto',
        }}
      >
        <input
          id={labelId}
          ref={checkboxRef}
          type="checkbox"
          checked={state === 'on'}
          onChange={(e) => {
            const escapedLabelName = escapeQuotes(props.label.name)
            if (e.target.checked) {
              props.applySearchQuery(
                `${props.searchTerm ?? ''} label:\"${escapedLabelName}\"`
              )
            } else {
              const query =
                props.searchTerm?.replace(
                  `label:\"${escapedLabelName}\"`,
                  ''
                ) ?? ''
              props.applySearchQuery(query)
            }
          }}
        />
      </SpanBox>
    </HStack>
  )
}

type EditButtonProps = {
  title: string
  destination: string
}

function EditButton(props: EditButtonProps): JSX.Element {
  return (
    <Link href={props.destination} passHref legacyBehavior>
      <SpanBox
        css={{
          ml: '10px',
          mb: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          '&:hover': {
            textDecoration: 'underline',
          },

          width: '100%',
          maxWidth: '100%',
          height: '32px',

          fontSize: '14px',
          fontWeight: 'regular',
          fontFamily: '$display',
          color: '$thLibraryMenuUnselected',
          verticalAlign: 'middle',
          borderRadius: '3px',
          cursor: 'pointer',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {props.title}
      </SpanBox>
    </Link>
  )
}
