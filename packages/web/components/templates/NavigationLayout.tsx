import { PageMetaData, PageMetaDataProps } from '../patterns/PageMetaData'
import { HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import { ReactNode, useEffect, useState, useCallback } from 'react'
import { navigationCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { useRouter } from 'next/router'
import { ConfirmationModal } from '../patterns/ConfirmationModal'
import { KeyboardShortcutListModal } from './KeyboardShortcutListModal'
import { setupAnalytics } from '../../lib/analytics'
import { primaryCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useLogout } from '../../lib/logout'
import { useApplyLocalTheme } from '../../lib/hooks/useApplyLocalTheme'
import { useRegisterActions } from 'kbar'
import { theme } from '../tokens/stitches.config'
import { NavigationMenu } from './navMenu/NavigationMenu'
import { Button } from '../elements/Button'
import { List } from '@phosphor-icons/react'
import { LIBRARY_LEFT_MENU_WIDTH } from './navMenu/LibraryLegacyMenu'
import { AddLinkModal } from './AddLinkModal'
import useWindowDimensions from '../../lib/hooks/useGetWindowDimensions'
import { useHandleAddUrl } from '../../lib/hooks/useHandleAddUrl'
import { useGetViewer } from '../../lib/networking/viewer/useGetViewer'
import { useQueryClient } from '@tanstack/react-query'

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
  title: string
  section: NavigationSection
  pageMetaDataProps?: PageMetaDataProps

  showNavigationMenu: boolean
  setShowNavigationMenu: (show: boolean) => void
}

export function NavigationLayout(props: NavigationLayoutProps): JSX.Element {
  useApplyLocalTheme()

  const router = useRouter()
  const queryClient = useQueryClient()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [showKeyboardCommandsModal, setShowKeyboardCommandsModal] =
    useState(false)
  const {
    data: viewerData,
    isFetching,
    isPending,
    isError,
    status,
  } = useGetViewer()

  useRegisterActions(navigationCommands(router))

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
    if (viewerData) {
      setupAnalytics(viewerData)
    }
    if (!viewerData && !isPending) {
      console.log('viewerData: ', viewerData, isFetching, isPending, status)
      // there was an error loading, so lets log out
      queryClient.clear()
      router.push(`/login`)
    }
  }, [viewerData])

  const showLogout = useCallback(() => {
    setShowLogoutConfirmation(true)
  }, [setShowLogoutConfirmation])

  const { width, previous } = useWindowDimensions()

  useEffect(() => {
    if (width < previous.width && width <= 768) {
      props.setShowNavigationMenu(false)
    }
  }, [width, previous])

  const [showAddLinkModal, setShowAddLinkModal] = useState(false)

  const handleLinkAdded = useHandleAddUrl()

  useEffect(() => {
    document.addEventListener('logout', showLogout)

    return () => {
      document.removeEventListener('logout', showLogout)
    }
  }, [showLogout])

  const { logout } = useLogout()

  return (
    <HStack
      css={{ width: '100vw', height: '100vh' }}
      distribution="start"
      alignment="start"
    >
      <PageMetaData path={props.section} title={props.title} />
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
          <SpanBox
            css={{
              display: 'none',
              position: 'fixed',
              zIndex: '2',
              backgroundColor: 'var(--colors-overlay)',
              '@mdDown': {
                display: 'flex',
                top: '0px',
                left: '0px',
                width: '100vw',
                height: '100vh',
                pointerEvents: 'auto',
              },
            }}
            onClick={(event) => {
              props.setShowNavigationMenu(false)
              event.stopPropagation()
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
