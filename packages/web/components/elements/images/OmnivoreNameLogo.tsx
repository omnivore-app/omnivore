import { config } from '../../tokens/stitches.config'
import Image from 'next/image'
import { StyledText } from '../../elements/StyledText'
import { OmnivoreLogoBase } from './OmnivoreLogoBase'

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

export function OmnivoreSmallLogo(props: OmnivoreLogoProps): JSX.Element {
  return (
    <svg
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.82329 12.9213V7.47867C5.82329 7.01332 6.36957 6.75029 6.73377 7.07402L8.4131 9.5222C8.75706 9.80546 9.24265 9.80546 9.58661 9.5222L11.2255 7.09425C11.5897 6.79075 12.136 7.03355 12.136 7.49891V10.372C12.136 11.768 13.0667 12.9011 14.4627 12.9011H14.5032C15.6969 12.9011 16.7288 12.0918 17.0121 10.9385C17.1537 10.3315 17.2751 9.70429 17.2751 9.2187C17.2549 4.46397 13.2285 0.862512 8.4131 1.18624C4.32605 1.4695 1.02808 4.76746 0.744823 8.85451C0.421097 13.6699 4.22489 17.6963 8.99985 17.6963"
        stroke={props.strokeColor}
        strokeWidth="1.4"
        strokeMiterlimit="10"
      />
    </svg>
  )
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
  showTitle?: boolean
}

export function OmnivoreNameLogo(props: OmnivoreNameLogoProps): JSX.Element {
  const fillColor = props.color || config.theme.colors.graySolid

  return (
    <OmnivoreLogoBase {...props}>
      <OmnivoreLogoIcon size={27} strokeColor={fillColor}></OmnivoreLogoIcon>
      {props.showTitle && (
        <StyledText
          style="logoTitle"
          css={{ color: fillColor, paddingLeft: '12px' }}
        >
          Omnivore
        </StyledText>
      )}
    </OmnivoreLogoBase>
  )
}
