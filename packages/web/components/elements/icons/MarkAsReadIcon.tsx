/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class MarkAsReadIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()
    // tick letters button
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 26 26`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M13 1C6.925 1 2 5.925 2 12C2 18.075 6.925 23 13 23C19.075 23 24 18.075 24 12C24 5.925 19.075 1 13 1Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.75 13.5L11.5 15.25L16.25 10.5"
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
