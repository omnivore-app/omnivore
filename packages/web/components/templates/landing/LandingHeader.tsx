import { Box } from '../../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'
import { Button } from '../../elements/Button'

const LoginButton = (): JSX.Element => {
  return (
    <Button
      style="ctaDarkYellow"
      css={{
        display: 'flex',
        marginLeft: 'auto',
        borderRadius: 4,
        border: 'unset',
        background: 'unset',
        color: '#3D3D3D',
        height: '42px',
        fontSize: 24,
        lineHeight: '24px',
        fontWeight: 'normal',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        document.location.href = '/login'
        e.preventDefault()
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
