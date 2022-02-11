import { Box, MediumBreakpointBox, VStack } from '../elements/LayoutPrimitives'
import { LoginForm } from './LoginForm'
import type { LoginFormProps } from './LoginForm'
import Image from 'next/image'
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
        }}
      >
        <OmnivoreNameLogo color={theme.colors.omnivoreGray.toString()} />
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
