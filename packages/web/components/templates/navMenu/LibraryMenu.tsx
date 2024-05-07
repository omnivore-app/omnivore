import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { Circle, DotsThree, MagnifyingGlass, X } from 'phosphor-react'
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
import { Shortcut } from '../../../pages/settings/shortcuts'
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
  const [labels, setLabels] = usePersistedState<Label[]>({
    key: 'menu-labels',
    isSessionStorage: false,
    initialValue: [],
  })
  const [savedSearches, setSavedSearches] = usePersistedState<SavedSearch[]>({
    key: 'menu-searches',
    isSessionStorage: false,
    initialValue: [],
  })
  const [subscriptions, setSubscriptions] = usePersistedState<Subscription[]>({
    key: 'menu-subscriptions',
    isSessionStorage: false,
    initialValue: [],
  })
  const labelsResponse = useGetLabelsQuery()
  const searchesResponse = useGetSavedSearchQuery()
  const subscriptionsResponse = useGetSubscriptionsQuery()

  useEffect(() => {
    if (
      !labelsResponse.error &&
      !labelsResponse.isLoading &&
      labelsResponse.labels
    ) {
      setLabels(labelsResponse.labels)
    }
  }, [setLabels, labelsResponse])

  useEffect(() => {
    if (
      !subscriptionsResponse.error &&
      !subscriptionsResponse.isLoading &&
      subscriptionsResponse.subscriptions
    ) {
      setSubscriptions(subscriptionsResponse.subscriptions)
    }
  }, [setSubscriptions, subscriptionsResponse])

  useEffect(() => {
    if (
      !searchesResponse.error &&
      !searchesResponse.isLoading &&
      searchesResponse.savedSearches
    ) {
      setSavedSearches(searchesResponse.savedSearches)
    }
  }, [setSavedSearches, searchesResponse])

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
      <NavButton
        {...props}
        text="Highlights"
        filterTerm="in:all has:highlights mode:highlights"
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
