import { Box, HStack } from '../../elements/LayoutPrimitives'

export function VerifyEmail(): JSX.Element {
  return (
    <>
      <HStack
        alignment="center"
        distribution="start"
        css={{
          width: '100vw',
          height: '100vh',
          color: '#898989',
          background: '#2A2A2A',
          overflowY: 'clip',
        }}
      >
        <Box
          css={{
            width: '100%',
            margin: '40px',
            '@xl': { margin: '138px' },
          }}
        >
          <h1 style={{ color: 'white' }}>Verify your email address</h1>
          <Box css={{ color: '#898989' }}>
            We sent a verification link to the email you provided. Click the
            link to verify your email. You may need to check your spam folder.
          </Box>
        </Box>
      </HStack>
    </>
  )
}
