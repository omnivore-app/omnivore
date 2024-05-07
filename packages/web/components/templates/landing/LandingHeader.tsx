import { Box } from '../../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'
import { Button } from '../../elements/Button'
import Link from 'next/link'

const LoginButton = (): JSX.Element => {
  return (
    <Button
      as={Link}
      href="/login"
      style="landingSimple"
      css={{ background: 'transparent' }}
    >
      Login
    </Button>
  )
}

export function LandingHeader(): JSX.Element {
  return (
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
      <OmnivoreNameLogo color="#898989" href="/login" />
      <LoginButton />
    </Box>
  )
}
