import Link from 'next/link'
import { useRouter } from 'next/router'
export type OmnivoreLogoBaseProps = {
  color?: string
  href?: string
  showTitle?: boolean
  children: React.ReactNode
}

export function OmnivoreLogoBase(props: OmnivoreLogoBaseProps): JSX.Element {
  const href = props.href || '/home'
  const router = useRouter()

  return (
    <Link
      passHref
      href={href}
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
      onClick={(event) => {
        const query = window.sessionStorage.getItem('q')
        if (query) {
          router.push(`/home?${query}`)
          event.preventDefault()
        }
      }}
      tabIndex={-1}
      aria-label="Omnivore logo"
    >
      {props.children}
    </Link>
  )
}
