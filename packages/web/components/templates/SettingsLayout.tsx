import { Box } from '../elements/LayoutPrimitives'
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
import { PageMetaData } from '../patterns/PageMetaData'
import { MobileNavBar } from '../patterns/MobileNavBar'

type SettingsLayoutProps = {
  title?: string
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
      <PageMetaData path='settings' title='Settings' />
        <PrimaryHeader
          user={viewerData?.me}
          isTransparent={false}
          userInitials={viewerData?.me?.name.charAt(0) ?? ''}
          profileImageURL={viewerData?.me?.profile.pictureUrl}
          setShowLogoutConfirmation={setShowLogoutConfirmation}
          setShowKeyboardCommandsModal={setShowKeyboardCommandsModal}
          title={props.title}
        />
        <Box
          css={{
            top: '48px',
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
        {/* <MobileNavBar user={viewerData?.me} /> */}
    </>
  )
}
