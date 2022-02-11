type ShareIconProps = {
  size: number
  strokeColor: string
  isCompleted: boolean
}

export function ShareIcon(props: ShareIconProps): JSX.Element {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox={`0 0 ${props.size} ${props.size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 11.2759L14 18V13.9655C12.5185 13.5172 7.33333 13.9655 2 18C4.66667 9.93103 10.5926 9.33333 14 9.03448V5L22 11.2759Z"
        stroke={props.strokeColor}
        fill={props.isCompleted ? props.strokeColor : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
