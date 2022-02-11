type PostIconProps = {
  size: number
  strokeColor: string
  isCompleted: boolean
}

export function PostIcon(props: PostIconProps): JSX.Element {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="3.5"
        stroke={props.strokeColor}
      />
      {props.isCompleted ? (
        <path
          d="M15 10L11 14L9 12"
          stroke={props.strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M12 9V12M12 15V12M12 12H15M12 12H9"
          stroke={props.strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
