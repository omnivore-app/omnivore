/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class UnarchiveIcon extends React.Component<IconProps> {
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
            d="M8.56992 4.54883H20.0283C20.5808 4.54883 21.1107 4.76832 21.5014 5.15902C21.8921 5.54972 22.1116 6.07963 22.1116 6.63216C22.1116 7.1847 21.8921 7.7146 21.5014 8.1053C21.1107 8.496 20.5808 8.71549 20.0283 8.71549H12.7366M8.56992 8.71549H5.44493C4.96862 8.71578 4.5066 8.55284 4.13584 8.25383C3.76509 7.95483 3.50798 7.5378 3.40737 7.07225C3.30675 6.60669 3.3687 6.12071 3.5829 5.69529C3.79709 5.26986 4.15059 4.93068 4.58451 4.73424"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.44531 8.7168V19.1335C5.44531 19.686 5.66481 20.2159 6.05551 20.6066C6.44621 20.9973 6.97611 21.2168 7.52865 21.2168H17.9453C18.3468 21.2168 18.7397 21.1007 19.0767 20.8827C19.4138 20.6646 19.6807 20.3538 19.8453 19.9876M20.0286 16.0085V8.7168"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.6533 12.8828H12.7367"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.36182 3.50781L22.1118 22.2578"
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
