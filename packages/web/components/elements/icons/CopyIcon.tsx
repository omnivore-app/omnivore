/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class CopyIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M8.66211 11.241C8.66211 10.6885 8.8816 10.1586 9.2723 9.76791C9.663 9.37721 10.1929 9.15771 10.7454 9.15771H19.0788C19.6313 9.15771 20.1612 9.37721 20.5519 9.76791C20.9426 10.1586 21.1621 10.6885 21.1621 11.241V19.5744C21.1621 20.1269 20.9426 20.6568 20.5519 21.0475C20.1612 21.4382 19.6313 21.6577 19.0788 21.6577H10.7454C10.1929 21.6577 9.663 21.4382 9.2723 21.0475C8.8816 20.6568 8.66211 20.1269 8.66211 19.5744V11.241Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.9941 9.15739V7.07406C16.9941 6.52152 16.7746 5.99162 16.3839 5.60092C15.9932 5.21022 15.4633 4.99072 14.9108 4.99072H6.57747C6.02494 4.99072 5.49504 5.21022 5.10433 5.60092C4.71363 5.99162 4.49414 6.52152 4.49414 7.07406V15.4074C4.49414 15.9599 4.71363 16.4898 5.10433 16.8805C5.49504 17.2712 6.02494 17.4907 6.57747 17.4907H8.66081"
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
