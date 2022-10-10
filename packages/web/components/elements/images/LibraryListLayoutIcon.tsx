type LibraryListLayoutIconProps = {
  color: string
}

export function LibraryListLayoutIcon(
  props: LibraryListLayoutIconProps
): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.5 0.747009H1.5C0.671573 0.747009 0 1.41858 0 2.24701V4.74701C0 5.57544 0.671573 6.24701 1.5 6.24701H22.5C23.3284 6.24701 24 5.57544 24 4.74701V2.24701C24 1.41858 23.3284 0.747009 22.5 0.747009Z"
        fill={props.color}
      />
      <path
        d="M22.5 9.24701H1.5C0.671573 9.24701 0 9.91858 0 10.747V13.247C0 14.0754 0.671573 14.747 1.5 14.747H22.5C23.3284 14.747 24 14.0754 24 13.247V10.747C24 9.91858 23.3284 9.24701 22.5 9.24701Z"
        fill={props.color}
      />
      <path
        d="M22.5 17.747H1.5C0.671573 17.747 0 18.4186 0 19.247V21.747C0 22.5754 0.671573 23.247 1.5 23.247H22.5C23.3284 23.247 24 22.5754 24 21.747V19.247C24 18.4186 23.3284 17.747 22.5 17.747Z"
        fill={props.color}
      />
    </svg>
  )
}
