import { ReactNode, useMemo } from 'react'
import { Box, HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import { LIBRARY_LEFT_MENU_WIDTH } from './homeFeed/LibraryFilterMenu'
import { LogoBox } from '../elements/LogoBox'
import Link from 'next/link'
import { styled, theme } from '../tokens/stitches.config'
import { Button } from '../elements/Button'
import { ArrowSquareUpRight } from 'phosphor-react'
import { useRouter } from 'next/router'

const HorizontalDivider = styled(SpanBox, {
  width: '100%',
  height: '1px',
  my: '25px',
  background: `${theme.colors.grayLine.toString()}`,
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

export function SettingsMenu(): JSX.Element {
  const section1 = [
    { name: 'Account', destination: '/settings/account' },
    { name: 'API Keys', destination: '/settings/api' },
    { name: 'Emails', destination: '/settings/emails' },
    { name: 'Feeds', destination: '/settings/feeds' },
    { name: 'Subscriptions', destination: '/settings/subscriptions' },
    { name: 'Labels', destination: '/settings/labels' },
  ]

  const section2 = [
    { name: 'Integrations', destination: '/settings/integrations' },
    { name: 'Install', destination: '/settings/installation' },
  ]
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
            pb: '50px',
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
          }}
          distribution="start"
          alignment="start"
        >
          {section1.map((item) => {
            return <SettingsButton key={item.name} {...item} />
          })}
          <HorizontalDivider />
          {section2.map((item) => {
            return <SettingsButton key={item.name} {...item} />
          })}
          <HorizontalDivider />
          <StyledLink>
            <Button
              style="link"
              onClick={(event) => {
                if (window.Intercom) {
                  window.Intercom('show')
                }
                event.preventDefault()
              }}
            >
              Feedback
            </Button>
          </StyledLink>
          <StyledLink
            css={{
              '> a': {
                backgroundColor: 'transparent',
                textDecoration: 'none',
              },
            }}
          >
            <a href="https://docs.omnivore.app" target="_blank">
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
                Documentation
                <ArrowSquareUpRight size={12} />
              </HStack>
            </a>
          </StyledLink>
        </VStack>
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
    <Link href={props.destination} passHref title={props.name}>
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
