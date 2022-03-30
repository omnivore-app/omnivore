type PlusIconProps = {
  size: number
  strokeColor: string
}

export function PlusIcon(props: PlusIconProps): JSX.Element {
  return (
    <svg 
      width={props.size}
      height={props.size} 
      viewBox={`0 0 ${props.size} ${props.size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 7.25C2.08579 7.25 1.75 7.58579 1.75 8C1.75 8.41421 2.08579 8.75 2.5 8.75V7.25ZM13.5 8.75C13.9142 8.75 14.25 8.41421 14.25 8C14.25 7.58579 13.9142 7.25 13.5 7.25V8.75ZM8.75 2.5C8.75 2.08579 8.41421 1.75 8 1.75C7.58579 1.75 7.25 2.08579 7.25 2.5H8.75ZM7.25 13.5C7.25 13.9142 7.58579 14.25 8 14.25C8.41421 14.25 8.75 13.9142 8.75 13.5H7.25ZM2.5 8.75H13.5V7.25H2.5V8.75ZM7.25 2.5V13.5H8.75V2.5H7.25Z"
        fill={props.strokeColor}
        fillOpacity="0.8"/>
    </svg>
  )
}
