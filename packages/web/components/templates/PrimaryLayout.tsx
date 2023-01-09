import { PageMetaData, PageMetaDataProps } from '../patterns/PageMetaData'
import { Box } from '../elements/LayoutPrimitives'
import {
  ReactNode,
  MutableRefObject,
  useEffect,
  useState,
} from 'react'
import { PrimaryHeader } from './../patterns/PrimaryHeader'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { navigationCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { useRouter } from 'next/router'
import { Analytics } from '@segment/analytics-next'
import { ConfirmationModal } from '../patterns/ConfirmationModal'
import { KeyboardShortcutListModal } from './KeyboardShortcutListModal'
import { logoutMutation } from '../../lib/networking/mutations/logoutMutation'

type PrimaryLayoutProps = {
  children: ReactNode
  pageTestId: string
  hideHeader?: boolean
  pageMetaDataProps?: PageMetaDataProps
  headerToolbarControl?: JSX.Element
  alwaysDisplayToolbar?: boolean
}

export function PrimaryLayout(props: PrimaryLayoutProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const router = useRouter()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [showKeyboardCommandsModal, setShowKeyboardCommandsModal] =
    useState(false)

  useKeyboardShortcuts(navigationCommands(router))

  // Attempt to identify the user if they are logged in.
  useEffect(() => {
    const user = window.analytics?.user().id()
    if (!user && viewerData?.me?.id) {
      window.analytics?.identify({ userId: viewerData?.me?.id })
    }
  }, [viewerData?.me?.id])

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
      {props.pageMetaDataProps ? (
        <PageMetaData {...props.pageMetaDataProps} />
      ) : null}
      <Box css={{
        width: '100vw',
        height: '100vh',
        bg: 'transparent',
        '@smDown': {
          bg: '$grayBase',
        }
      }}>
        <PrimaryHeader
          user={viewerData?.me}
          hideHeader={props.hideHeader}
          userInitials={viewerData?.me?.name.charAt(0) ?? ''}
          profileImageURL={viewerData?.me?.profile.pictureUrl}
          isTransparent={true}
          toolbarControl={props.headerToolbarControl}
          alwaysDisplayToolbar={props.alwaysDisplayToolbar}
          setShowLogoutConfirmation={setShowLogoutConfirmation}
          setShowKeyboardCommandsModal={setShowKeyboardCommandsModal}
        />
        <Box
          css={{
            height: '100%',
            width: '100vw',
            bg: '$grayBase',
          }}
        >
          <Box
          css={{
            height: '48px',
            bg: '$grayBase',
          }}
        ></Box>
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
      </Box>
      <div data-testid={props.pageTestId} />
    </>
  )
}
