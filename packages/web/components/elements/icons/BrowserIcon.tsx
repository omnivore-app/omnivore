/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class BrowserIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M2.5 10C2.5 10.9849 2.69399 11.9602 3.0709 12.8701C3.44781 13.7801 4.00026 14.6069 4.6967 15.3033C5.39314 15.9997 6.21993 16.5522 7.12987 16.9291C8.03982 17.306 9.01509 17.5 10 17.5C10.9849 17.5 11.9602 17.306 12.8701 16.9291C13.7801 16.5522 14.6069 15.9997 15.3033 15.3033C15.9997 14.6069 16.5522 13.7801 16.9291 12.8701C17.306 11.9602 17.5 10.9849 17.5 10C17.5 8.01088 16.7098 6.10322 15.3033 4.6967C13.8968 3.29018 11.9891 2.5 10 2.5C8.01088 2.5 6.10322 3.29018 4.6967 4.6967C3.29018 6.10322 2.5 8.01088 2.5 10Z"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 7.5H17"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 12.5H17"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.58322 2.5C8.17934 4.74968 7.43506 7.34822 7.43506 10C7.43506 12.6518 8.17934 15.2503 9.58322 17.5"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.4167 2.5C11.8206 4.74968 12.5649 7.34822 12.5649 10C12.5649 12.6518 11.8206 15.2503 10.4167 17.5"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs></defs>
      </svg>
    )
  }
}
