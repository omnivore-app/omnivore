type CommentIconProps = {
  size: number
  strokeColor: string
}

export function CommentIcon(props: CommentIconProps): JSX.Element {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox={`0 0 ${props.size} ${props.size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8C3 6.11438 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H17C18.8856 4 19.8284 4 20.4142 4.58579C21 5.17157 21 6.11438 21 8V15C21 16.8856 21 17.8284 20.4142 18.4142C19.8284 19 18.8856 19 17 19H8.44521C7.83771 19 7.53395 19 7.25198 19.0849C7.12378 19.1235 6.99978 19.1748 6.88184 19.2382C6.62244 19.3776 6.40765 19.5923 5.97808 20.0219V20.0219C4.90967 21.0903 4.37546 21.6245 3.90841 21.5816C3.70708 21.5631 3.51609 21.484 3.36063 21.3547C3 21.0548 3 20.2993 3 18.7884V8Z"
        stroke={props.strokeColor}
        strokeLinejoin="round"
      />
      <ellipse cx="9" cy="11.5" rx="1.5" ry="1.5" fill={props.strokeColor} />
      <ellipse cx="15" cy="11.5" rx="1.5" ry="1.5" fill={props.strokeColor} />
    </svg>
  )
}
