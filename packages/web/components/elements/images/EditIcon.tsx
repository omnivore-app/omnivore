type EditIconProps = {
  size: number
  strokeColor: string
}

export function EditIcon(props: EditIconProps): JSX.Element {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox={`0 0 ${props.size} ${props.size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.0837 1.08398L14.417 4.41732L5.25033 13.584H1.91699V10.2507L11.0837 1.08398Z"
        stroke={props.strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.91699 16.918H16.0837"
        stroke={props.strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
