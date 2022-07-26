import { Box, HStack, MediumBreakpointBox, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import type { LoginFormProps } from '../LoginForm'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'
import { theme } from '../../tokens/stitches.config'

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
          We sent a verification link to the email you provided.
          Click the link to verify your email. You may need to check
          your spam folder.
        </Box>
      </Box>
    </HStack>
    </>
  )
}
