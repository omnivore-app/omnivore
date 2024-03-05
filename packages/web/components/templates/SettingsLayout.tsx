import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { navigationCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { useRouter } from 'next/router'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { useCallback, useEffect, useState } from 'react'
import { ConfirmationModal } from '../patterns/ConfirmationModal'
import { KeyboardShortcutListModal } from './KeyboardShortcutListModal'
import { PageMetaData } from '../patterns/PageMetaData'
import { DEFAULT_HEADER_HEIGHT } from './homeFeed/HeaderSpacer'
import { logout } from '../../lib/logout'
import { SettingsMenu } from './navMenu/SettingsMenu'
import { SettingsDropdown } from './navMenu/SettingsDropdown'
import { useVerifyAuth } from '../../lib/hooks/useVerifyAuth'

type SettingsLayoutProps = {
  title?: string
  children: React.ReactNode
}

export function SettingsLayout(props: SettingsLayoutProps): JSX.Element {
  useVerifyAuth()

  const router = useRouter()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [showKeyboardCommandsModal, setShowKeyboardCommandsModal] =
    useState(false)

  useKeyboardShortcuts(navigationCommands(router))
  applyStoredTheme()

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
    <VStack
      alignment="start"
      distribution="start"
      css={{ width: '100%', height: '100%', minHeight: '100vh' }}
    >
      <PageMetaData path="settings" title="Settings" />
      <VStack css={{ width: '100%', height: '100%' }}>
        <Box
          css={{
            height: DEFAULT_HEADER_HEIGHT,
            '@mdDown': {
              display: 'none',
            },
          }}
        ></Box>
        <Box
          css={{
            p: '15px',
            display: 'none',
            height: DEFAULT_HEADER_HEIGHT,
            '@mdDown': {
              display: 'flex',
            },
          }}
        >
          <SettingsDropdown />
        </Box>
        <HStack css={{ width: '100%', height: '100%' }} distribution="start">
          <SettingsMenu />
          {props.children}
        </HStack>
        <Box css={{ height: '120px', width: '100%' }} />
      </VStack>
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
    </VStack>
  )
}
