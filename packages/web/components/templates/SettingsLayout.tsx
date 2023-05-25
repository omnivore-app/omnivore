import { Box, VStack } from '../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { SettingsHeader } from '../patterns/SettingsHeader'
import { navigationCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { useRouter } from 'next/router'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { logoutMutation } from '../../lib/networking/mutations/logoutMutation'
import { useState } from 'react'
import { ConfirmationModal } from '../patterns/ConfirmationModal'
import { KeyboardShortcutListModal } from './KeyboardShortcutListModal'
import { PageMetaData } from '../patterns/PageMetaData'
import { HEADER_HEIGHT } from './homeFeed/HeaderSpacer'

type SettingsLayoutProps = {
  title?: string
  children: React.ReactNode
}

export function SettingsLayout(props: SettingsLayoutProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const router = useRouter()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [showKeyboardCommandsModal, setShowKeyboardCommandsModal] =
    useState(false)

  useKeyboardShortcuts(navigationCommands(router))
  applyStoredTheme(false)

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

  return (
    <>
      <PageMetaData path="settings" title="Settings" />
      <SettingsHeader user={viewerData?.me} />
      <VStack css={{ width: '100%', height: '100%' }}>
        <Box
          css={{
            height: HEADER_HEIGHT,
            bg: '$grayBase',
          }}
        ></Box>
        {props.children}
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
    </>
  )
}
