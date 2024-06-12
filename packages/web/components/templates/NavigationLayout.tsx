import { PageMetaData, PageMetaDataProps } from '../patterns/PageMetaData'
import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { navigationCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { NextRouter, useRouter } from 'next/router'
import { ConfirmationModal } from '../patterns/ConfirmationModal'
import { KeyboardShortcutListModal } from './KeyboardShortcutListModal'
import { setupAnalytics } from '../../lib/analytics'
import { primaryCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { logout } from '../../lib/logout'
import { useApplyLocalTheme } from '../../lib/hooks/useApplyLocalTheme'
import { updateTheme } from '../../lib/themeUpdater'
import { Priority, useRegisterActions } from 'kbar'
import { ThemeId, theme } from '../tokens/stitches.config'
import { NavigationMenu } from './navMenu/NavigationMenu'
import { DEFAULT_HEADER_HEIGHT } from './homeFeed/HeaderSpacer'
import { Button } from '../elements/Button'
import { List } from '@phosphor-icons/react'
import { usePersistedState } from '../../lib/hooks/usePersistedState'
import 'allotment/dist/style.css'
import { LibrarySideBar } from './library/LibrarySideBar'

export type NavigationSection =
  | 'home'
  | 'library'
  | 'subscriptions'
  | 'highlights'
  | 'archive'
  | 'trash'

type NavigationLayoutProps = {
  children: ReactNode
  rightPane?: ReactNode
  section: NavigationSection
  pageMetaDataProps?: PageMetaDataProps
}

export function NavigationLayout(props: NavigationLayoutProps): JSX.Element {
  useApplyLocalTheme()

  const { viewerData } = useGetViewerQuery()
  const router = useRouter()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [showKeyboardCommandsModal, setShowKeyboardCommandsModal] =
    useState(false)

  const [showNavMenu, setShowNavMenu] = usePersistedState<boolean>({
    key: 'nav-show-menu',
    isSessionStorage: false,
    initialValue: true,
  })

  useKeyboardShortcuts(navigationCommands(router))

  useKeyboardShortcuts(
    primaryCommands((action) => {
      switch (action) {
        case 'toggleShortcutHelpModalDisplay':
          setShowKeyboardCommandsModal(true)
          break
      }
    })
  )

  useRegisterActions(
    [
      {
        id: 'home',
        section: 'Navigation',
        name: 'Go to Home (Library) ',
        shortcut: ['g h'],
        keywords: 'go home',
        perform: () => router?.push('/home'),
      },
      {
        id: 'lightTheme',
        section: 'Preferences',
        name: 'Change theme (light) ',
        shortcut: ['v', 'l'],
        keywords: 'light theme',
        priority: Priority.LOW,
        perform: () => updateTheme(ThemeId.Light),
      },
      {
        id: 'darkTheme',
        section: 'Preferences',
        name: 'Change theme (dark) ',
        shortcut: ['v', 'd'],
        keywords: 'dark theme',
        priority: Priority.LOW,
        perform: () => updateTheme(ThemeId.Dark),
      },
    ],
    [router]
  )

  // Attempt to identify the user if they are logged in.
  useEffect(() => {
    setupAnalytics(viewerData?.me)
  }, [viewerData?.me])

  const showLogout = useCallback(() => {
    setShowLogoutConfirmation(true)
  }, [setShowLogoutConfirmation])

  useEffect(() => {
    document.addEventListener('logout', showLogout)

    return () => {
      document.removeEventListener('logout', showLogout)
    }
  }, [showLogout])

  return (
    <HStack
      css={{ width: '100vw', height: '100vh' }}
      distribution="start"
      alignment="start"
    >
      {props.pageMetaDataProps ? (
        <PageMetaData {...props.pageMetaDataProps} />
      ) : null}
      <Header
        toggleMenu={() => {
          setShowNavMenu(!showNavMenu)
        }}
      />
      {showNavMenu && (
        <NavigationMenu
          section={props.section}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          setShowAddLinkModal={() => {}}
          showMenu={showNavMenu}
          setShowMenu={setShowNavMenu}
        />
      )}
      {props.children}
      {showLogoutConfirmation ? (
        <ConfirmationModal
          message={'Are you sure you want to log out?'}
          onAccept={logout}
          onOpenChange={() => setShowLogoutConfirmation(false)}
        />
      ) : null}
      {showKeyboardCommandsModal ? (
        <KeyboardShortcutListModal
          onOpenChange={() => setShowKeyboardCommandsModal(false)}
        />
      ) : null}
    </HStack>
  )
}

type HeaderProps = {
  toggleMenu: () => void
}

const Header = (props: HeaderProps): JSX.Element => {
  const small = false

  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{
        zIndex: 5,
        position: 'fixed',
        left: '15px',
        top: '15px',
        height: small ? '60px' : DEFAULT_HEADER_HEIGHT,
        transition: 'height 0.5s',
        '@lgDown': { px: '20px' },
        '@mdDown': {
          px: '10px',
          left: '0px',
          right: '0',
        },
      }}
    >
      <VStack alignment="center" distribution="center">
        <Button
          style="plainIcon"
          onClick={(event) => {
            props.toggleMenu()
            event.preventDefault()
          }}
          css={{ height: 'unset' }}
        >
          <List size="25" color={theme.colors.readerTextSubtle.toString()} />
        </Button>
      </VStack>
    </VStack>
  )
}
