import { ReactNode, useCallback, useRef, useState } from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { DotsThree } from '@phosphor-icons/react'
import { theme } from '../../tokens/stitches.config'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { NavMenuFooter } from './Footer'
import { FollowingIcon } from '../../elements/icons/FollowingIcon'
import { HomeIcon } from '../../elements/icons/HomeIcon'
import { LibraryIcon } from '../../elements/icons/LibraryIcon'
import { HighlightsIcon } from '../../elements/icons/HighlightsIcon'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { useRouter } from 'next/router'
import { NavigationSection } from '../NavigationLayout'
import { TreeApi } from 'react-arborist'
import React from 'react'
import { ArchiveSectionIcon } from '../../elements/icons/ArchiveSectionIcon'
import { NavMoreButtonDownIcon } from '../../elements/icons/NavMoreButtonDown'
import { NavMoreButtonUpIcon } from '../../elements/icons/NavMoreButtonUp'
import { TrashSectionIcon } from '../../elements/icons/TrashSectionIcon'
import {
  Shortcut,
  useResetShortcuts,
} from '../../../lib/networking/shortcuts/useShortcuts'
import { ShortcutsTree } from '../ShortcutsTree'

export const LIBRARY_LEFT_MENU_WIDTH = '275px'

type NavigationMenuProps = {
  section: NavigationSection

  setShowAddLinkModal: (show: boolean) => void

  showMenu: boolean
  setShowMenu: (show: boolean) => void
}

export function NavigationMenu(props: NavigationMenuProps): JSX.Element {
  const [dismissed, setDismissed] = useState(false)
  return (
    <>
      <Box
        css={{
          left: '0px',
          top: '0px',
          position: 'fixed',
          height: '100%',
          width: LIBRARY_LEFT_MENU_WIDTH,
          bg: '$thLeftMenuBackground',
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '@mdDown': {
            transition: 'left 100ms, visibility 100ms',
            top: '0',
            left: props.showMenu && !dismissed ? '0' : '-280px',
            visibility: props.showMenu && !dismissed ? 'visible' : 'hidden',
            boxShadow:
              props.showMenu && !dismissed
                ? `0px 4px 4px 0px rgba(0, 0, 0, 0.15)`
                : 'unset',
          },
          zIndex: 5,
        }}
        onClick={(event) => {
          // on small screens we want to dismiss the menu after click
          // if (window.innerWidth <= 768) {
          //   setDismissed(true)
          //   setTimeout(() => {
          //     props.setShowMenu(false)
          //   }, 100)
          // }
          event.stopPropagation()
        }}
      >
        {/* This gives a header when scrolling so the menu button is visible still */}
        <Box
          css={{
            position: 'fixed',
            width: LIBRARY_LEFT_MENU_WIDTH,
            top: '0',
            left: '0',
            height: '60px',
            bg: '$thLeftMenuBackground',
            zIndex: '100',
            visibility: props.showMenu && !dismissed ? 'visible' : 'hidden',
          }}
        ></Box>
        <Box css={{ width: '100%', height: '60px' }}></Box>

        <LibraryNav {...props} />
        <Shortcuts {...props} />
        <NavMenuFooter {...props} showFullThemeSection={true} />
        <Box css={{ height: '250px ' }} />
      </Box>
    </>
  )
}

const LibraryNav = (props: NavigationMenuProps): JSX.Element => {
  const [moreFolderSectionOpen, setMoreFolderSectionOpen] =
    usePersistedState<boolean>({
      key: 'nav-more-folder-open',
      isSessionStorage: false,
      initialValue: true,
    })
  return (
    <VStack
      css={{
        m: '0px',
        mt: '10px',
        gap: '5px',
        width: '100%',
        borderBottom: '1px solid $thBorderColor',
        px: '0px',
        pb: '15px',
      }}
      alignment="start"
      distribution="start"
    >
      <NavButton
        {...props}
        text="Home"
        section="home"
        isSelected={props.section == 'home'}
        icon={<HomeIcon color={theme.colors.thLibraryMenuPrimary.toString()} />}
      />
      <NavButton
        {...props}
        text="Library"
        section="library"
        isSelected={props.section == 'library'}
        icon={
          <LibraryIcon color={theme.colors.thLibraryMenuPrimary.toString()} />
        }
      />
      <NavButton
        {...props}
        text="Subscriptions"
        section="subscriptions"
        isSelected={props.section == 'subscriptions'}
        icon={
          <FollowingIcon color={theme.colors.thLibraryMenuPrimary.toString()} />
        }
      />
      <NavButton
        {...props}
        text="Highlights"
        section="highlights"
        isSelected={props.section == 'highlights'}
        icon={
          <HighlightsIcon
            color={theme.colors.thLibraryMenuPrimary.toString()}
          />
        }
      />

      <NavButton
        {...props}
        text="Archive"
        section="archive"
        isSelected={props.section == 'archive'}
        icon={
          <ArchiveSectionIcon
            color={theme.colors.thLibraryMenuPrimary.toString()}
          />
        }
      />
      <NavButton
        {...props}
        text="Trash"
        section="trash"
        isSelected={props.section == 'trash'}
        icon={
          <TrashSectionIcon
            color={theme.colors.thLibraryMenuPrimary.toString()}
          />
        }
      />
    </VStack>
  )
}

const Shortcuts = (props: NavigationMenuProps): JSX.Element => {
  const router = useRouter()
  const treeRef = useRef<TreeApi<Shortcut> | undefined>(undefined)
  const resetShortcuts = useResetShortcuts()

  const createNewFolder = useCallback(async () => {
    if (treeRef.current) {
      const result = await treeRef.current.create({
        type: 'internal',
        index: 0,
      })
    }
  }, [treeRef])

  const resetShortcutsToDefault = useCallback(async () => {
    await resetShortcuts.mutateAsync()
  }, [])

  return (
    <VStack
      css={{
        m: '0px',
        gap: '8px',
        width: '100%',
        px: '0px',
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
            color: '$homeTextSubtle',
            mb: '10px',
            px: '15px',
          }}
        >
          Shortcuts
        </StyledText>
        <SpanBox css={{ display: 'flex', ml: 'auto', mt: '5px', mr: '15px' }}>
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
            <DropdownOption
              onSelect={resetShortcutsToDefault}
              title="Reset to default"
            />
            <DropdownOption
              onSelect={createNewFolder}
              title="Create new folder"
            />
          </Dropdown>
        </SpanBox>
      </HStack>
      <Box
        css={{
          width: '100%',
          height: '100%',
          '[role="treeitem"]': {
            outline: 'none',
          },
          '[role="treeitem"]:focus': {
            outline: 'none',
          },
        }}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <ShortcutsTree treeRef={treeRef} />
      </Box>
    </VStack>
  )
}

type NavButtonProps = {
  text: string
  icon: ReactNode

  isSelected: boolean
  section: NavigationSection

  setShowMenu: (show: boolean) => void
}

function NavButton(props: NavButtonProps): JSX.Element {
  const router = useRouter()

  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        mb: '2px',
        gap: '10px',
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        height: '34px',
        px: '20px',

        backgroundColor: props.isSelected
          ? '$thLibrarySelectionColor'
          : 'unset',
        fontSize: '15px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: props.isSelected
          ? '$thLibraryMenuSecondary'
          : '$thLibraryMenuUnselected',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&:hover': {
          backgroundColor: props.isSelected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
        '&:active': {
          backgroundColor: props.isSelected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
      }}
      title={props.text}
      onClick={(e) => {
        router.push(`/` + props.section)
      }}
    >
      {props.icon}
      {props.text}
    </HStack>
  )
}
