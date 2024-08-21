import { PageMetaData, PageMetaDataProps } from '../patterns/PageMetaData'
import { Box } from '../elements/LayoutPrimitives'
import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { useRouter } from 'next/router'
import { ConfirmationModal } from '../patterns/ConfirmationModal'
import { KeyboardShortcutListModal } from './KeyboardShortcutListModal'
import { setupAnalytics } from '../../lib/analytics'
import { primaryCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useLogout } from '../../lib/logout'
import { useApplyLocalTheme } from '../../lib/hooks/useApplyLocalTheme'
import { updateTheme } from '../../lib/themeUpdater'
import { Priority, useRegisterActions } from 'kbar'
import { ThemeId } from '../tokens/stitches.config'
import { useGetViewer } from '../../lib/networking/viewer/useGetViewer'

type PrimaryLayoutProps = {
  children: ReactNode
  pageTestId: string
  hideHeader?: boolean
  pageMetaDataProps?: PageMetaDataProps
  headerToolbarControl?: JSX.Element
  alwaysDisplayToolbar?: boolean
}

export function PrimaryLayout(props: PrimaryLayoutProps): JSX.Element {
  useApplyLocalTheme()

  const { data: viewerData } = useGetViewer()
  const router = useRouter()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [showKeyboardCommandsModal, setShowKeyboardCommandsModal] =
    useState(false)

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
    if (viewerData) {
      setupAnalytics(viewerData)
    }
  }, [viewerData])

  const showLogout = useCallback(() => {
    setShowLogoutConfirmation(true)
  }, [setShowLogoutConfirmation])

  useEffect(() => {
    document.addEventListener('logout', showLogout)

    return () => {
      document.removeEventListener('logout', showLogout)
    }
  }, [showLogout])

  const { logout } = useLogout()

  return (
    <>
      {props.pageMetaDataProps ? (
        <PageMetaData {...props.pageMetaDataProps} />
      ) : null}
      <Box
        css={{
          height: '100%',
          width: '100vw',
          bg: '$thBackground2',
        }}
      >
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
      </Box>
      <div data-testid={props.pageTestId} />
    </>
  )
}
