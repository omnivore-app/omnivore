import { PageMetaData, PageMetaDataProps } from '../patterns/PageMetaData'
import { Box } from '../elements/LayoutPrimitives'
import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { navigationCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { useRouter } from 'next/router'
import { ConfirmationModal } from '../patterns/ConfirmationModal'
import { KeyboardShortcutListModal } from './KeyboardShortcutListModal'
import { logoutMutation } from '../../lib/networking/mutations/logoutMutation'
import { setupAnalytics } from '../../lib/analytics'
import { primaryCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { applyStoredTheme } from '../../lib/themeUpdater'

type PrimaryLayoutProps = {
  children: ReactNode
  pageTestId: string
  hideHeader?: boolean
  pageMetaDataProps?: PageMetaDataProps
  headerToolbarControl?: JSX.Element
  alwaysDisplayToolbar?: boolean
}

export function SplitPageLayout(props: PrimaryLayoutProps): JSX.Element {
  applyStoredTheme(false)

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

  // Attempt to identify the user if they are logged in.
  useEffect(() => {
    setupAnalytics(viewerData?.me)

    const user = window.analytics?.user().id()
    if (!user && viewerData?.me?.id) {
      window.analytics?.identify({ userId: viewerData?.me?.id })
    }
  }, [viewerData?.me])

  async function logout(): Promise<void> {
    await logoutMutation()
    try {
      const result = await logoutMutation()
      if (!result) {
        throw new Error('Logout failed')
      }
      router.push('/login')
    } catch {
      // TODO: display an error message instead
      router.push('/')
    }
  }

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
    <>
      {props.pageMetaDataProps ? (
        <PageMetaData {...props.pageMetaDataProps} />
      ) : null}
      <Box
        css={{
          height: '100%',
          width: '100%',
          bg: '$readerBg',
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
