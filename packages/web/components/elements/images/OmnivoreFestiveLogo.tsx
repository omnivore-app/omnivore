import { config } from '../../tokens/stitches.config'
import Image from 'next/image'
import Link from 'next/link'

export type OmnivoreFestiveLogoProps = {
  color?: string
  href?: string
}

export function OmnivoreFestiveLogo(
  props: OmnivoreFestiveLogoProps
): JSX.Element {
  const fillColor = props.color || config.theme.colors.graySolid
  const href = props.href || '/home'

  return (
    <Link
      passHref
      href={href}
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Image
        src="/static/images/omnivore-logo-santa.png"
        width="27"
        height="27"
        alt=""
      />
    </Link>
  )
}
