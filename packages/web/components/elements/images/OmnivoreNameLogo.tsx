import { config } from '../../tokens/stitches.config'
import Image from 'next/image'
import { StyledText } from '../../elements/StyledText'
import Link from 'next/link'

export function OmnivoreNameLogoImage(): JSX.Element {
  return (
    <Image
      src="/static/icons/logo-landing.svg"
      alt="Image of Omnivore name with Logo"
      width={136}
      height={27}
    />
  )
}

type OmnivoreLogoProps = {
  size: number
  strokeColor: string
}

export function OmnivoreLogoIcon(props: OmnivoreLogoProps): JSX.Element {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox={`0 0 ${props.size} ${props.size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.13628 18.637V10.8781C9.13628 10.2147 9.91506 9.8397 10.4342 10.3012L12.8283 13.7913C13.3186 14.1951 14.0108 14.1951 14.5012 13.7913L16.8375 10.33C17.3567 9.89738 18.1355 10.2435 18.1355 10.9069V15.0027C18.1355 16.9929 19.4623 18.6081 21.4525 18.6081H21.5101C23.2119 18.6081 24.6829 17.4544 25.0867 15.8103C25.2886 14.945 25.4617 14.0508 25.4617 13.3586C25.4329 6.58038 19.693 1.44624 12.8283 1.90774C7.00186 2.31154 2.30037 7.01303 1.89657 12.8394C1.43507 19.7042 6.85765 25.444 13.6647 25.444"
        stroke={props.strokeColor}
        strokeWidth="2.29961"
        strokeMiterlimit="10"
      />
    </svg>
  )
}

export type OmnivoreNameLogoProps = {
  color?: string
  href?: string
}

export function OmnivoreNameLogo(props: OmnivoreNameLogoProps): JSX.Element {
  const fillColor = props.color || config.theme.colors.graySolid
  const href = props.href || '/home'

  return (
    <Link passHref href={href}>
      <a style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <OmnivoreLogoIcon size={27} strokeColor={fillColor}></OmnivoreLogoIcon>
        <StyledText style="logoTitle" css={{ color: fillColor, paddingLeft: '12px' }}>Omnivore</StyledText>
      </a>
    </Link>
  )
}
