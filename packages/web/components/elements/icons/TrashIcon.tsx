/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class TrashIcon extends React.Component<IconProps> {
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
            d="M4.40332 7.67383H21.07"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.6533 11.8418V18.0918"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.8203 11.8418V18.0918"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.44531 7.67383L6.48698 20.1738C6.48698 20.7264 6.70647 21.2563 7.09717 21.647C7.48787 22.0377 8.01778 22.2572 8.57031 22.2572H16.9036C17.4562 22.2572 17.9861 22.0377 18.3768 21.647C18.7675 21.2563 18.987 20.7264 18.987 20.1738L20.0286 7.67383"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.61182 7.67448V4.54948C9.61182 4.27321 9.72156 4.00826 9.91691 3.81291C10.1123 3.61756 10.3772 3.50781 10.6535 3.50781H14.8201C15.0964 3.50781 15.3614 3.61756 15.5567 3.81291C15.7521 4.00826 15.8618 4.27321 15.8618 4.54948V7.67448"
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
