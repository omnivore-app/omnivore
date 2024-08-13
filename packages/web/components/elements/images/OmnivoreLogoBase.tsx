import Link from 'next/link'
import { useRouter } from 'next/router'
import { DEFAULT_HOME_PATH } from '../../../lib/navigations'
import { Box } from '../LayoutPrimitives'
export type OmnivoreLogoBaseProps = {
  color?: string
  href?: string
  showTitle?: boolean
  children: React.ReactNode
}

export function OmnivoreLogoBase(props: OmnivoreLogoBaseProps): JSX.Element {
  return (
    <Box
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
      onClick={(event) => {
        const navReturn = window.localStorage.getItem('nav-return')
        if (navReturn) {
          window.location.assign(navReturn)
          return
        }
        const query = window.sessionStorage.getItem('q')
        if (query) {
          window.location.assign(`${DEFAULT_HOME_PATH}?${query}`)
        } else {
          window.location.replace(DEFAULT_HOME_PATH)
        }
      }}
      tabIndex={-1}
      aria-label="Omnivore logo"
    >
      {props.children}
    </Box>
  )
}
