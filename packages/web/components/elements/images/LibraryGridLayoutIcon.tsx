type LibraryGridLayoutIconProps = {
  color: string
}

export function LibraryGridLayoutIcon(props: LibraryGridLayoutIconProps): JSX.Element {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_3573_89627)">
      <path d="M9.5 -0.00299072H1.5C0.671573 -0.00299072 0 0.668582 0 1.49701V9.49701C0 10.3254 0.671573 10.997 1.5 10.997H9.5C10.3284 10.997 11 10.3254 11 9.49701V1.49701C11 0.668582 10.3284 -0.00299072 9.5 -0.00299072Z" fill={props.color} />
      <path d="M22.5 -0.00299072H14.5C13.6716 -0.00299072 13 0.668582 13 1.49701V9.49701C13 10.3254 13.6716 10.997 14.5 10.997H22.5C23.3284 10.997 24 10.3254 24 9.49701V1.49701C24 0.668582 23.3284 -0.00299072 22.5 -0.00299072Z" fill={props.color} />
      <path d="M9.5 12.997H1.5C0.671573 12.997 0 13.6686 0 14.497V22.497C0 23.3254 0.671573 23.997 1.5 23.997H9.5C10.3284 23.997 11 23.3254 11 22.497V14.497C11 13.6686 10.3284 12.997 9.5 12.997Z" fill={props.color} />
      <path d="M22.5 12.997H14.5C13.6716 12.997 13 13.6686 13 14.497V22.497C13 23.3254 13.6716 23.997 14.5 23.997H22.5C23.3284 23.997 24 23.3254 24 22.497V14.497C24 13.6686 23.3284 12.997 22.5 12.997Z" fill={props.color} />
      </g>
      <defs>
      <clipPath id="clip0_3573_89627">
      <rect width="24" height="24" fill="white"/>
      </clipPath>
      </defs>
    </svg>
  )
}