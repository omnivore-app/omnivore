/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class ArchiveIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()

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
            d="M3.36182 6.63216C3.36182 6.07963 3.58131 5.54972 3.97201 5.15902C4.36271 4.76832 4.89262 4.54883 5.44515 4.54883H20.0285C20.581 4.54883 21.1109 4.76832 21.5016 5.15902C21.8923 5.54972 22.1118 6.07963 22.1118 6.63216C22.1118 7.1847 21.8923 7.7146 21.5016 8.1053C21.1109 8.496 20.581 8.71549 20.0285 8.71549H5.44515C4.89262 8.71549 4.36271 8.496 3.97201 8.1053C3.58131 7.7146 3.36182 7.1847 3.36182 6.63216Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.44531 8.7168V19.1335C5.44531 19.686 5.66481 20.2159 6.05551 20.6066C6.44621 20.9973 6.97611 21.2168 7.52865 21.2168H17.9453C18.4978 21.2168 19.0277 20.9973 19.4185 20.6066C19.8092 20.2159 20.0286 19.686 20.0286 19.1335V8.7168"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.6533 12.8828H14.82"
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
