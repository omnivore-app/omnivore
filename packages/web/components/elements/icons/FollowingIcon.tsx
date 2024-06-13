/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class FollowingIcon extends React.Component<IconProps> {
  render() {
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M11.5361 4.14185L3.86945 7.97518L11.5361 11.8085L19.2028 7.97518L11.5361 4.14185Z"
            fill={color}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.86945 11.8086L11.5361 15.6419L19.2028 11.8086"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.86945 15.6418L11.5361 19.4752L19.2028 15.6418"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  }
}
