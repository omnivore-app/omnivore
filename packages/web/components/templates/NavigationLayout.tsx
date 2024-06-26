import { PageMetaData, PageMetaDataProps } from '../patterns/PageMetaData'
import { HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { navigationCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { useRouter } from 'next/router'
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
import { Button } from '../elements/Button'
import { List } from '@phosphor-icons/react'
import { LIBRARY_LEFT_MENU_WIDTH } from './navMenu/LibraryLegacyMenu'
import { AddLinkModal } from './AddLinkModal'
import { saveUrlMutation } from '../../lib/networking/mutations/saveUrlMutation'
import {
  showErrorToast,
  showSuccessToastWithAction,
} from '../../lib/toastHelpers'

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

  showNavigationMenu: boolean
  setShowNavigationMenu: (show: boolean) => void
}

export function NavigationLayout(props: NavigationLayoutProps): JSX.Element {
  useApplyLocalTheme()

  const { viewerData } = useGetViewerQuery()
  const router = useRouter()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [showKeyboardCommandsModal, setShowKeyboardCommandsModal] =
    useState(false)

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

  const [showAddLinkModal, setShowAddLinkModal] = useState(false)

  const handleLinkAdded = useCallback(
    async (link: string, timezone: string, locale: string) => {
      const result = await saveUrlMutation(link, timezone, locale)
      if (result) {
        showSuccessToastWithAction('Link saved', 'Read now', async () => {
          window.location.href = `/article?url=${encodeURIComponent(link)}`
          return Promise.resolve()
        })
        // const id = result.url?.match(/[^/]+$/)?.[0] ?? ''
        // performActionOnItem('refresh', undefined as unknown as any)
      } else {
        showErrorToast('Error saving link', { position: 'bottom-right' })
      }
    },
    []
  )

  useEffect(() => {
    document.addEventListener('logout', showLogout)

    return () => {
      document.removeEventListener('logout', showLogout)
    }
  }, [showLogout])

  // if (isLoading) {
  //   return (
  //     <HStack
  //       css={{ width: '100vw', height: '100vh' }}
  //       distribution="start"
  //       alignment="start"
  //     ></HStack>
  //   )
  // }

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
        menuOpen={props.showNavigationMenu}
        toggleMenu={() => {
          props.setShowNavigationMenu(!props.showNavigationMenu)
        }}
      />
      {props.showNavigationMenu && (
        <>
          <NavigationMenu
            section={props.section}
            setShowAddLinkModal={setShowAddLinkModal}
            showMenu={props.showNavigationMenu}
            setShowMenu={props.setShowNavigationMenu}
          />
          <SpanBox
            css={{
              width: LIBRARY_LEFT_MENU_WIDTH,
              flexShrink: '0',
              '@mdDown': {
                display: 'none',
              },
            }}
          ></SpanBox>
        </>
      )}
      {props.children}
      {showLogoutConfirmation && (
        <ConfirmationModal
          message={'Are you sure you want to log out?'}
          onAccept={logout}
          onOpenChange={() => setShowLogoutConfirmation(false)}
        />
      )}
      {showKeyboardCommandsModal && (
        <KeyboardShortcutListModal
          onOpenChange={() => setShowKeyboardCommandsModal(false)}
        />
      )}
      {showAddLinkModal && (
        <AddLinkModal
          onOpenChange={setShowAddLinkModal}
          handleLinkSubmission={handleLinkAdded}
        />
      )}
    </HStack>
  )
}

type HeaderProps = {
  menuOpen: boolean
  toggleMenu: () => void
}

const Header = (props: HeaderProps): JSX.Element => {
  return (
    <VStack
      alignment="start"
      distribution="center"
      css={{
        zIndex: 10,
        position: props.menuOpen ? 'fixed' : 'absolute',
        left: '0px',
        top: '0px',
        pl: '20px',
        pt: '20px',

        height: '58px',
      }}
    >
      <Button
        style="plainIcon"
        onClick={(event) => {
          props.toggleMenu()
          event.preventDefault()
        }}
        css={{ height: 'unset', display: 'flex' }}
      >
        <List size="25" color={theme.colors.readerTextSubtle.toString()} />
      </Button>
    </VStack>
  )
}
