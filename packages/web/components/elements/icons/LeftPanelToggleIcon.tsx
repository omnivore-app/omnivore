/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class LeftPanelToggleIcon extends React.Component<IconProps> {
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
            d="M4.90039 6.73861C4.90039 6.18607 5.11988 5.65617 5.51058 5.26547C5.90129 4.87477 6.43119 4.65527 6.98372 4.65527H19.4837C20.0363 4.65527 20.5662 4.87477 20.9569 5.26547C21.3476 5.65617 21.5671 6.18607 21.5671 6.73861V19.2386C21.5671 19.7911 21.3476 20.321 20.9569 20.7117C20.5662 21.1024 20.0363 21.3219 19.4837 21.3219H6.98372C6.43119 21.3219 5.90129 21.1024 5.51058 20.7117C5.11988 20.321 4.90039 19.7911 4.90039 19.2386V6.73861Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.1094 4.65527V21.3219"
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
