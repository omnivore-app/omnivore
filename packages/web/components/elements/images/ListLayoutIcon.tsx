export type ListLayoutIconProps = {
  color: string
}

export function ListLayoutIcon(props: ListLayoutIconProps): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect y="3" width="1" height="1" rx="0.5" fill={props.color} />
      <rect y="8" width="1" height="1" rx="0.5" fill={props.color} />
      <rect y="13" width="1" height="1" rx="0.5" fill={props.color} />
      <rect x="3" y="3" width="13" height="1" rx="0.5" fill={props.color} />
      <rect x="3" y="8" width="13" height="1" rx="0.5" fill={props.color} />
      <rect x="3" y="13" width="13" height="1" rx="0.5" fill={props.color} />
    </svg>
  )
}

export default ListLayoutIcon
