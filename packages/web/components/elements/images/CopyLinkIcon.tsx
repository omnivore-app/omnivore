type CopyLinkIconProps = {
  strokeColor: string
  isCompleted: boolean
}

export function CopyLinkIcon(props: CopyLinkIconProps): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="7.5"
        y="7.5"
        width="13"
        height="13"
        rx="1.5"
        stroke={props.strokeColor}
      />
      <path
        d="M16 4H7C5.34315 4 4 5.34315 4 7V15"
        stroke={props.strokeColor}
        strokeLinecap="round"
      />
      {props.isCompleted && (
        <path
          d="M16 12.666L13.3333 15.3327L12 13.9993"
          stroke={props.strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
