import Link from 'next/link'
import { HStack, VStack, Box } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { PrimaryHeader } from '../patterns/PrimaryHeader'
import { navigationCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { useRouter } from 'next/router'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { logoutMutation } from '../../lib/networking/mutations/logoutMutation'
import { useState } from 'react'
import { ConfirmationModal } from '../patterns/ConfirmationModal'
import { KeyboardShortcutListModal } from './KeyboardShortcutListModal'

type SettingsLayoutProps = {
  children: React.ReactNode
}

export function SettingsLayout(props: SettingsLayoutProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const router = useRouter()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [showKeyboardCommandsModal, setShowKeyboardCommandsModal] = useState(false)

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
        <PrimaryHeader
          user={viewerData?.me}
          isFixedPosition={false}
          userInitials={viewerData?.me?.name.charAt(0) ?? ''}
          profileImageURL={viewerData?.me?.profile.pictureUrl}
          setShowLogoutConfirmation={setShowLogoutConfirmation}
          setShowKeyboardCommandsModal={setShowKeyboardCommandsModal}
        />
        <Box
          css={{
            top: '68px',
            '@smDown': { top: '48px' },
            position: 'fixed',
            overflowY: 'auto',
            height: '100%',
            width: '100vw',
            bg: '$grayBase',
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
    </>
  )
}
