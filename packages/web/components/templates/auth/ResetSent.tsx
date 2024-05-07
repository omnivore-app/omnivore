import { Box, HStack } from '../../elements/LayoutPrimitives'

export function ResetSent(): JSX.Element {
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
            color: '#898989',
            '@xl': { margin: '138px' },
          }}
        >
          <h1 style={{ color: 'white' }}>Reset email sent</h1>
          <Box>
            If there is an account associated with the email specified we sent a
            password reset link. Click the link to reset your password. You may
            need to check your spam folder.
          </Box>
        </Box>
      </HStack>
    </>
  )
}
