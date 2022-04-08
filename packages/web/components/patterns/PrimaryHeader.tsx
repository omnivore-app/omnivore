import { Box, HStack, SpanBox } from '../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from './../elements/images/OmnivoreNameLogo'
import { DropdownMenu, HeaderDropdownAction } from './../patterns/DropdownMenu'
import { updateTheme } from '../../lib/themeUpdater'
import { AvatarDropdown } from './../elements/AvatarDropdown'
import { theme, ThemeId } from './../tokens/stitches.config'
import { useCallback, useEffect, useState } from 'react'
import {
  ScrollOffsetChangeset,
  useScrollWatcher,
} from '../../lib/hooks/useScrollWatcher'
import { useRouter } from 'next/router'
import { useKeyboardShortcuts } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { primaryCommands } from '../../lib/keyboardShortcuts/navigationShortcuts'
import { darkenTheme, lightenTheme } from '../../lib/themeUpdater'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import { setupAnalytics } from '../../lib/analytics'
import { Button } from '../elements/Button'
import Link from 'next/link'
import { ArchiveBox, ArrowSquareOut, DotsThree, HighlighterCircle, TagSimple, TextAa } from 'phosphor-react'

type HeaderProps = {
  user?: UserBasicData
  userInitials: string
  hideHeader?: boolean
  profileImageURL?: string
  isFixedPosition: boolean
  scrollElementRef?: React.RefObject<HTMLDivElement>
  displayFontStepper?: boolean
  setShowLogoutConfirmation: (showShareModal: boolean) => void
  setShowKeyboardCommandsModal: (showShareModal: boolean) => void
}

export function PrimaryHeader(props: HeaderProps): JSX.Element {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useKeyboardShortcuts(
    primaryCommands((action) => {
      switch (action) {
        case 'themeDarker':
          darkenTheme()
          break
        case 'themeLighter':
          lightenTheme()
          break
        case 'toggleShortcutHelpModalDisplay':
          props.setShowKeyboardCommandsModal(true)
          break
      }
    })
  )

  const setScrollWatchedElement = useScrollWatcher(
    (changeset: ScrollOffsetChangeset) => {
      const isScrolledBeyondMinThreshold = changeset.current.y >= 50
      const isScrollingDown = changeset.current.y > changeset.previous.y

      // setIsScrolled(isScrolledBeyondMinThreshold)
      // setShowHeader(!(isScrollingDown && isScrolledBeyondMinThreshold))
    },
    0
  )

  useEffect(() => {
    if (props.scrollElementRef) {
      setScrollWatchedElement(props.scrollElementRef.current)
    }
  }, [props.scrollElementRef, setScrollWatchedElement])

  const initAnalytics = useCallback(() => {
    setupAnalytics(props.user)
  }, [props.user])

  useEffect(() => {
    initAnalytics()
    window.addEventListener('load', initAnalytics)
    return () => {
      window.removeEventListener('load', initAnalytics)
    }
  }, [initAnalytics])

  function headerDropdownActionHandler(action: HeaderDropdownAction): void {
    switch (action) {
      case 'apply-darker-theme':
        updateTheme(ThemeId.Darker)
        break
      case 'apply-dark-theme':
        updateTheme(ThemeId.Dark)
        break
      case 'apply-lighter-theme':
        updateTheme(ThemeId.Lighter)
        break
      case 'apply-light-theme':
        updateTheme(ThemeId.Light)
        break
      case 'increaseFontSize':
        document.dispatchEvent(new Event('increaseFontSize'))
        break
      case 'decreaseFontSize':
        document.dispatchEvent(new Event('decreaseFontSize'))
        break
      case 'navigate-to-install':
        router.push('/settings/installation')
        break
      case 'navigate-to-emails':
        router.push('/settings/emails')
        break
      case 'navigate-to-profile':
        if (props.user) {
          router.push(`/${props.user.profile.username}`)
        }
        break
      case 'logout':
        props.setShowLogoutConfirmation(true)
        break
      default:
        break
    }
  }

  return (
    <>
      <NavHeader
        {...props}
        username={props.user?.profile.username}
        actionHandler={headerDropdownActionHandler}
        isDisplayingShadow={isScrolled}
        isVisible={true}
        isFixedPosition={true}
        displayFontStepper={props.displayFontStepper}
      />
    </>
  )
}

// Separating out component so we can extract to design system
type NavHeaderProps = {
  username?: string
  userInitials: string
  actionHandler: (action: HeaderDropdownAction) => void
  profileImageURL?: string
  isDisplayingShadow?: boolean
  isVisible?: boolean
  isFixedPosition: boolean
  displayFontStepper?: boolean
}

function NavHeader(props: NavHeaderProps): JSX.Element {
  const router = useRouter()
  const currentPath = decodeURI(router.asPath)

  return (
    <nav>
      <HStack
        alignment="center"
        distribution="between"
        css={{
          zIndex: 5,
          width: '100%',
          boxShadow: props.isDisplayingShadow ? '$panelShadow' : 'unset',
          bg: '$grayBase',
          p: '0px $3 0px $3',
          height: '68px',
          position: 'fixed',
          minHeight: '68px',
          '@smDown': {
            height: '48px',
            minHeight: '48px',
            p: '0px 18px 0px 16px',
          },
        }}
      >
        <HStack alignment="center" distribution="start">
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              paddingRight: '10px',
            }}
          >
            <OmnivoreNameLogo href={props.username ? '/home' : '/login'} />
          </Box>
          <NavLinks currentPath={currentPath} isLoggedIn={!!props.username} />
        </HStack>

        <HStack distribution="end" alignment="center" css={{
  height: '100%',
  width: '100%',
  display: 'none',
  '@lgDown': {
    display: 'flex',
  },
  mr: '16px',
  }}
>
        <HStack distribution="end" alignment="center" css={{
  gap: '4px',
  // background: 'red',
  height: '100%',
  width: '100%',
  m: '0px',
  }}
>
          <Button style='plainIcon'>
            <TextAa size={24} color='#5D5C5B' />
          </Button>

          <Button style='plainIcon'>
            <TagSimple size={24} color='#5D5C5B' />
          </Button>
          <Button style='plainIcon'>
            <HighlighterCircle size={24} color='#5D5C5B' />
          </Button>

          <Button style='plainIcon'>
            <ArchiveBox size={24} color='#5D5C5B' />
          </Button>

          <Button style='plainIcon'>
            <DotsThree size={24} color='#5D5C5B' />
          </Button>
        </HStack>
      </HStack>


        {props.username ? (
          <HStack
            alignment="center"
            css={{ display: 'flex', alignItems: 'center' }}
          >
            {/* <Box css={{ '@smDown': { visibility: 'collapse' } }}>
              <a href="https://github.com/omnivore-app/omnivore" target='_blank' rel="noreferrer">
                <Button style="ctaLightGray" css={{ background: 'unset', mr: '32px' }}>
                  <HStack css={{ height: '100%' }}>
                    <svg version="1.1" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                      <path fill={theme.colors.grayTextContrast.toString()} fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                    <SpanBox css={{ pl: '8px', color: '$grayTextContrast' }}>Follow us on GitHub</SpanBox>
                    <Box className='ctaButtonIcon' css={{ ml: '4px' }}>
                      <ArrowSquareOut size={16} />
                    </Box>
                  </HStack>
                </Button>
              </a>
            </Box> */}
            <DropdownMenu
              username={props.username}
              triggerElement={
                <AvatarDropdown
                  userInitials={props.userInitials}
                  profileImageURL={props.profileImageURL}
                />
              }
              actionHandler={props.actionHandler}
              displayFontStepper={props.displayFontStepper}
            />
          </HStack>
        ) : (
          <Link passHref href="/login">
            <Button style="ctaDarkYellow">Sign Up</Button>
          </Link>
        )}
      </HStack>
    </nav>
  )
}

type UserNavLinksProps = {
  isLoggedIn: boolean
  currentPath: string
}

function NavLinks(props: UserNavLinksProps): JSX.Element {
  return (
    <>
      {/* <HeaderNavLink
        isActive={props.currentPath.startsWith('/home')}
        href={props.isLoggedIn ? '/home' : '/login'}
        text="Home"
      /> */}
      {/* <HeaderNavLink
        isActive={props.currentPath == '/discover'}
        href="/discover"
        text="Discover"
      /> */}
    </>
  )
}
