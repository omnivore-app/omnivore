import { Box, HStack, MediumBreakpointBox, SpanBox, VStack } from '../elements/LayoutPrimitives'
import { LoginForm } from './LoginForm'
import type { LoginFormProps } from './LoginForm'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import { theme } from '../tokens/stitches.config'

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
    <HStack
      alignment="center"
      distribution="start"
      css={{
        width: '100vw',
        height: '100vh',
        bg: '$omnivoreYellow',
        overflowY: 'clip'
      }}
    >
      <Box css={{
        width: '100%',
        margin: '40px',
        '@xl': { margin: '138px' },
        }}>
        <LoginForm {...props} />
      </Box>
      <OmnivoreIllustration isLargeLayout={true} />
    </HStack>
  )
}

type OmnivoreIllustrationProps = {
  isLargeLayout?: boolean
}

function OmnivoreIllustration({ isLargeLayout }: OmnivoreIllustrationProps) {
  return (
    <Box css={{
      width: '100%',
      height: '100%',
      marginRight: '57px',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPositionY: '70px',
      backgroundImage: `-webkit-image-set(
        url('/static/images/landing-illustration.png') 1x,
        url('/static/images/landing-illustration@2x.png') 2x
      )`,
      'background-image': `image-set(
        url('/static/images/landing-illustration.png') 1x,
        url('/static/images/landing-illustration@2x.png') 2x
      )`
    }} />
  )
}

