import { Box } from '../../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'
import { Button } from '../../elements/Button'
import Link from 'next/link'

const LoginButton = (): JSX.Element => {
  return (
    <Button
      as={Link}
      href="/login"
      style="ctaDarkYellow"
      css={{
        display: 'flex',
        marginLeft: 'auto',
        borderRadius: 4,
        background: 'unset',
        color: '#3D3D3D',
        height: '42px',
        fontSize: 24,
        lineHeight: '24px',
        fontWeight: 'normal',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: "none",
        transition: "all ease-in 50ms"
      }}
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
      <OmnivoreNameLogo color={'#3D3D3D'} href="/login" />
      <LoginButton />
    </Box>
  )
}
