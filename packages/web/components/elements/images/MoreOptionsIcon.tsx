type Orientation = 'horizontal' | 'vertical'

type MoreOptionsIconProps = {
  size: number
  strokeColor: string
  orientation: Orientation
}

export function MoreOptionsIcon(props: MoreOptionsIconProps): JSX.Element {
  const dots =
    props.orientation == 'horizontal' ? (
      <>
        <circle
          cx="7"
          cy="12"
          r="1.5"
          transform="rotate(-90 7 12)"
          fill={props.strokeColor}
        />
        <circle
          cx="12"
          cy="12"
          r="1.5"
          transform="rotate(-90 12 12)"
          fill={props.strokeColor}
        />
        <circle
          cx="17"
          cy="12"
          r="1.5"
          transform="rotate(-90 17 12)"
          fill={props.strokeColor}
        />
      </>
    ) : (
      <>
        <circle cx="12" cy="6" r="1.5" fill={props.strokeColor} />
        <circle cx="12" cy="12" r="1.5" fill={props.strokeColor} />
        <circle cx="12" cy="18" r="1.5" fill={props.strokeColor} />
      </>
    )

  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {dots}
    </svg>
  )
}
