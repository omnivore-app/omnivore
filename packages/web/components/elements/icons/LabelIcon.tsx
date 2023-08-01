/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class LabelIcon extends React.Component<IconProps> {
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
            d="M9.09098 10.2786C9.66628 10.2786 10.1326 9.81228 10.1326 9.23698C10.1326 8.66168 9.66628 8.19531 9.09098 8.19531C8.51569 8.19531 8.04932 8.66168 8.04932 9.23698C8.04932 9.81228 8.51569 10.2786 9.09098 10.2786Z"
            fill={color}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.40332 7.67383V11.6936C4.40332 12.253 4.6252 12.7895 5.02103 13.1853L13.4752 21.6395C13.6711 21.8354 13.9036 21.9908 14.1596 22.0968C14.4155 22.2028 14.6898 22.2574 14.9669 22.2574C15.2439 22.2574 15.5182 22.2028 15.7742 22.0968C16.0301 21.9908 16.2627 21.8354 16.4585 21.6395L21.4939 16.604C21.6899 16.4082 21.8453 16.1756 21.9513 15.9197C22.0573 15.6637 22.1119 15.3894 22.1119 15.1124C22.1119 14.8353 22.0573 14.561 21.9513 14.3051C21.8453 14.0491 21.6899 13.8166 21.4939 13.6207L13.0387 5.16654C12.6434 4.77122 12.1072 4.54904 11.5481 4.54883H7.52832C6.69952 4.54883 5.90466 4.87807 5.31861 5.46412C4.73256 6.05017 4.40332 6.84503 4.40332 7.67383Z"
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
