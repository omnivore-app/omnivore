import { useMemo } from 'react'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { LIBRARY_LEFT_MENU_WIDTH } from './LibraryMenu'
import { LogoBox } from '../../elements/LogoBox'
import Link from 'next/link'
import { styled, theme } from '../../tokens/stitches.config'
import { Button } from '../../elements/Button'
import { ArrowSquareUpRight } from '@phosphor-icons/react'
import { useRouter } from 'next/router'
import { NavMenuFooter } from './Footer'

export const SETTINGS_SECTION_1 = [
  { name: 'Account', destination: '/settings/account' },
  { name: 'API Keys', destination: '/settings/api' },
  { name: 'Emails', destination: '/settings/emails' },
  { name: 'Feeds', destination: '/settings/feeds' },
  { name: 'Subscriptions', destination: '/settings/subscriptions' },
  { name: 'Labels', destination: '/settings/labels' },
  // { name: 'Shortcuts', destination: '/settings/shortcuts' },
  { name: 'Saved Searches', destination: '/settings/saved-searches' },
  { name: 'Pinned Searches', destination: '/settings/pinned-searches' },
]

export const SETTINGS_SECTION_2 = [
  { name: 'Rules', destination: '/settings/rules' },
  { name: 'Integrations', destination: '/settings/integrations' },
  { name: 'Install', destination: '/settings/installation' },
]

const HorizontalDivider = styled(SpanBox, {
  width: '100%',
  height: '1px',
  my: '5px',
  opacity: '0.1',
  background: `${theme.colors.thTextSubtle3.toString()}`,
})

const StyledLink = styled(SpanBox, {
  pl: '25px',
  ml: '10px',
  mb: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  '&:hover': {
    textDecoration: 'underline',
  },

  width: 'calc(100% - 10px)',
  maxWidth: '100%',
  height: '32px',

  fontSize: '14px',
  fontWeight: 'regular',
  fontFamily: '$display',
  color: '$thLibraryMenuUnselected',
  verticalAlign: 'middle',
  borderRadius: '3px',
  cursor: 'pointer',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

type ExternalLinkProps = {
  title: string
  destination: string
}

function ExternalLink(props: ExternalLinkProps): JSX.Element {
  return (
    <StyledLink
      css={{
        '> a': {
          backgroundColor: 'transparent',
          textDecoration: 'none',
        },
      }}
      title={props.title}
    >
      <a href={props.destination} target="_blank" rel="noreferrer">
        <HStack
          distribution="start"
          alignment="center"
          css={{
            gap: '5px',
            color: '$thLibraryMenuUnselected',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {props.title}
          <ArrowSquareUpRight size={12} />
        </HStack>
      </a>
    </StyledLink>
  )
}

export function SettingsMenu(): JSX.Element {
  return (
    <>
      <Box
        css={{
          left: '0px',
          top: '0px',
          position: 'fixed',
          bg: '$thLeftMenuBackground',
          height: '100%',
          width: LIBRARY_LEFT_MENU_WIDTH,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '@mdDown': {
            visibility: 'hidden',
            width: '100%',
            transition: 'visibility 0s, top 150ms',
          },
          zIndex: 3,
        }}
      >
        <Box
          css={{
            width: '100%',
            px: '25px',
            pb: '25px',
            pt: '4.5px',
            lineHeight: '1',
          }}
        >
          <LogoBox />
        </Box>

        <VStack
          css={{
            gap: '10px',
            width: '100%',
            overflowY: 'scroll',
            paddingBottom: '120px',
          }}
          distribution="start"
          alignment="start"
        >
          {SETTINGS_SECTION_1.map((item) => {
            return <SettingsButton key={item.name} {...item} />
          })}
          <HorizontalDivider />
          {SETTINGS_SECTION_2.map((item) => {
            return <SettingsButton key={item.name} {...item} />
          })}
          <HorizontalDivider />
          <StyledLink>
            <Button
              style="link"
              onClick={(event) => {
                if (window.Intercom) {
                  try {
                    window.Intercom('show')
                  } catch (error) {
                    console.log(error)
                    alert('error opening system feedback')
                  }
                } else {
                  alert('error opening system feedback')
                }
                event.preventDefault()
              }}
            >
              Feedback
            </Button>
          </StyledLink>
          <ExternalLink
            destination="https://blog.omnivore.app/p/contributing-to-omnivore"
            title="Contribute"
          />
          <ExternalLink
            destination="https://docs.omnivore.app"
            title="Documentation"
          />
        </VStack>
        <NavMenuFooter />
      </Box>
      {/* This spacer pushes library content to the right of 
      the fixed left side menu. */}
      <Box
        css={{
          minWidth: LIBRARY_LEFT_MENU_WIDTH,
          height: '100%',
          bg: '$thBackground',
          '@mdDown': {
            display: 'none',
          },
        }}
      ></Box>
    </>
  )
}

type SettingsButtonProps = {
  name: string
  destination: string
}

function SettingsButton(props: SettingsButtonProps): JSX.Element {
  const router = useRouter()
  const selected = useMemo(() => {
    if (router && router.isReady) {
      return router.asPath.endsWith(props.destination)
    }
    return false
  }, [props, router])

  return (
    <Link href={props.destination} passHref title={props.name} legacyBehavior>
      <SpanBox
        css={{
          mx: '10px',
          pl: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',

          width: 'calc(100% - 20px)',
          maxWidth: '100%',
          height: '32px',

          fontSize: '14px',
          fontWeight: 'regular',
          fontFamily: '$display',
          verticalAlign: 'middle',
          borderRadius: '3px',
          cursor: 'pointer',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',

          backgroundColor: selected ? '$thLibrarySelectionColor' : 'unset',

          color: selected
            ? '$thLibraryMenuSecondary'
            : '$thLibraryMenuUnselected',

          '&:hover': {
            textDecoration: 'underline',
            backgroundColor: selected
              ? '$thLibrarySelectionColor'
              : '$thBackground4',
          },
          '&:active': {
            backgroundColor: selected
              ? '$thLibrarySelectionColor'
              : '$thBackground4',
          },
        }}
      >
        {props.name}
      </SpanBox>
    </Link>
  )
}
