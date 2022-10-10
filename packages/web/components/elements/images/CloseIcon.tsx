type CloseIconProps = {
  size: number
  strokeColor: string
}

export function CloseIcon(props: CloseIconProps): JSX.Element {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox={`0 0 ${props.size} ${props.size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.75 5.75L5.25 19.25"
        stroke={props.strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.75 19.25L5.25 5.75"
        stroke={props.strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
