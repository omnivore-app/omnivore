
export type GridLayoutIconProps = {
  color: string
}

export function GridLayoutIcon(props: GridLayoutIconProps): JSX.Element {

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="6"
        height="6"
        rx="1"
        stroke={
          props.color
        }
      />
      <rect
        x="1"
        y="9"
        width="6"
        height="6"
        rx="1"
        stroke={props.color}
      />
      <rect
        x="9"
        y="1"
        width="6"
        height="6"
        rx="1"
        stroke={props.color}
      />
      <rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="1"
        stroke={props.color}
      />
    </svg>
  )
}

export default GridLayoutIcon
