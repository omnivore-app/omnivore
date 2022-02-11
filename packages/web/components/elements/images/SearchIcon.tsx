type SearchIconProps = {
  strokeColor: string
}

export function SearchIcon(props: SearchIconProps): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.4">
        <circle
          cx="7.00008"
          cy="6.99984"
          r="4.33333"
          stroke={props.strokeColor}
          strokeWidth="1.8"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path
          d="M13.3333 13.3335L10.3333 10.3335"
          stroke={props.strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
