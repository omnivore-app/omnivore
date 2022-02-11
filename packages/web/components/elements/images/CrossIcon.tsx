type CrossIconProps = {
  size: number
  strokeColor: string
}

export function CrossIcon(props: CrossIconProps): JSX.Element {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox={`0 0 ${props.size} ${props.size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.33398 1.33301L6.00065 5.99967M6.00065 5.99967L10.6673 10.6663M6.00065 5.99967L10.6673 1.33301M6.00065 5.99967L1.33398 10.6663"
        stroke={props.strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
