/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class TreeRightIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 18).toString()
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 18 18"
        fill="none"
      >
        <g>
          <path
            d="M6.75 13.5L11.25 9L6.75 4.5"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  }
}
