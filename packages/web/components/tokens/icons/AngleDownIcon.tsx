import { config } from '../stitches.config'

type AngleDownIconProps = {
  color?: string
}

export function AngleDownIcon(props: AngleDownIconProps): JSX.Element {
  const strokeColor = props.color || config.theme.colors.graySolid
  return (
    <svg
      width='9'
      height='6'
      viewBox="0 0 9 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.3335 1.33333L4.66683 4.66667L8.00016 1.33333"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
