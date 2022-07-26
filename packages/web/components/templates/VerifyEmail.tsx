import { Box, HStack, MediumBreakpointBox, SpanBox, VStack } from '../elements/LayoutPrimitives'
import type { LoginFormProps } from './LoginForm'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import { theme } from '../tokens/stitches.config'

export function VerifyEmail(props: LoginFormProps): JSX.Element {
  return (
    <>
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
        color: '$omnivoreGray',
        '@xl': { margin: '138px' },
        }}>
        <h1>Verify your email address</h1>
        <Box>
          We sent a verification link to the email you provided. Click the link to verify your email. You may need to check your spam folder.
        </Box>
      </Box>
    </HStack>
      

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
