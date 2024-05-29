/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from '../IconProps'

import React from 'react'

export class AddToLibraryActionIcon extends React.Component<IconProps> {
  render() {
    const strokeColor = (this.props.color || '#D9D9D9').toString()
    const backgroundColor = (this.props.color || '#3D3D3D').toString()

    return (
      <svg
        width="50"
        height="32"
        viewBox="0 0 50 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="50" height="32" rx="4" fill={backgroundColor} />
        <g>
          <path
            d="M30 11.8333V23.5L25 20.1667L20 23.5V11.8333C20 10.9493 20.3512 10.1014 20.9763 9.47631C21.6014 8.85119 22.4493 8.5 23.3333 8.5H26.6667C27.5507 8.5 28.3986 8.85119 29.0237 9.47631C29.6488 10.1014 30 10.9493 30 11.8333Z"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  }
}
