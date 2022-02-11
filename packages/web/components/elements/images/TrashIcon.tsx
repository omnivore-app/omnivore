type TrashIconProps = {
  size: number
  strokeColor: string
}

export function TrashIcon(props: TrashIconProps): JSX.Element {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.6663 8.33333L11.4163 14.1667M8.58301 14.1667L8.33301 8.33333M4.99967 5L5.70854 15.633C5.77858 16.6836 6.65119 17.5 7.70411 17.5H12.2952C13.3482 17.5 14.2208 16.6836 14.2908 15.633L14.9997 5M4.99967 5H7.49967M4.99967 5H3.33301M14.9997 5H16.6663M14.9997 5H12.4997M12.4997 5V4.5C12.4997 3.39543 11.6042 2.5 10.4997 2.5H9.49967C8.3951 2.5 7.49967 3.39543 7.49967 4.5V5M12.4997 5H7.49967"
        stroke={props.strokeColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
