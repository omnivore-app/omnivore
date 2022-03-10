import { Box, HStack, MediumBreakpointBox, SpanBox, VStack } from '../elements/LayoutPrimitives'
import { LoginForm } from './LoginForm'
import type { LoginFormProps } from './LoginForm'
import Image from 'next/image'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import { theme } from '../tokens/stitches.config'
import { Button } from '../elements/Button'

export function LoginLayout(props: LoginFormProps): JSX.Element {
  return (
    <>
      <MediumBreakpointBox
        smallerLayoutNode={<MobileLoginLayout {...props} />}
        largerLayoutNode={<MediumLoginLayout {...props} />}
      />

      <Box
        css={{
          position: 'absolute',
          top: 0,
          left: 0,
          p: '0px 15px 0px 15px',
          height: '68px',
          minHeight: '68px',
          display: 'flex',
          alignItems: 'center',
          '@md': { width: '50%' },
          '@xsDown': { height: '48px' },
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <OmnivoreNameLogo color={theme.colors.omnivoreGray.toString()} href='/login' />
        <Box css={{
          marginLeft: 'auto',
          fontSize: '15px',
          fontWeight: '500',
          verticalAlign: 'middle',
          textAlign: 'center',
          cursor: 'pointer',
          lineHeight: '100%',
          textDecoration: 'none',
        }}>
          <Box css={{ '@xsmDown': { visibility: 'collapse' } }}>
            <a href="https://github.com/omnivore-app/omnivore" target='_blank' rel="noreferrer">
              <Button style="ctaLightGray">
                <HStack css={{ height: '100%' }}>
                  <SpanBox css={{ pt: '5px', pr: '6px' }}>Follow on GitHub</SpanBox>
                  <SpanBox css={{ alpha: '0.1' }}>
                  <svg version="1.1" width="24" height="24" viewBox="0 0 16 16" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                  </svg>
                  </SpanBox>
                </HStack>
              </Button>
            </a>
          </Box>
        </Box>
      </Box>
    </>
  )
}

function MobileLoginLayout(props: LoginFormProps) {
  return (
    <VStack css={{ height: '100vh', overflow: 'auto' }}>
      <VStack
        alignment="center"
        distribution="center"
        css={{
          bg: '$omnivoreYellow',
          width: '100%',
          flexGrow: 1,
        }}
      >
        <LoginForm {...props} />
      </VStack>
    </VStack>
  )
}

function MediumLoginLayout(props: LoginFormProps) {
  return (
    <Box
      css={{
        display: 'grid',
        height: '100vh',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <VStack
        alignment="center"
        distribution="center"
        css={{ bg: '$omnivoreYellow' }}
      >
        <LoginForm {...props} />
      </VStack>
      <VStack alignment="center" css={{ bg: '$omnivorePeach' }}>
        <OmnivoreIllustration isLargeLayout={true} />
      </VStack>
    </Box>
  )
}

type OmnivoreIllustrationProps = {
  isLargeLayout?: boolean
}

function OmnivoreIllustration({ isLargeLayout }: OmnivoreIllustrationProps) {
  return (
    <Image
      src={`/static/images/landing-illustration${
        isLargeLayout ? '@2x.png' : '-mobile.svg'
      }`}
      alt="Illustration of Woman Reading"
      width={isLargeLayout ? 1280 : 375}
      height={isLargeLayout ? 1164 : 230}
    />
  )
}
