/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class CircleUtilityMenuIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M3.125 12.5C3.125 13.7311 3.36749 14.9502 3.83863 16.0877C4.30977 17.2251 5.00032 18.2586 5.87087 19.1291C6.74142 19.9997 7.77492 20.6902 8.91234 21.1614C10.0498 21.6325 11.2689 21.875 12.5 21.875C13.7311 21.875 14.9502 21.6325 16.0877 21.1614C17.2251 20.6902 18.2586 19.9997 19.1291 19.1291C19.9997 18.2586 20.6902 17.2251 21.1614 16.0877C21.6325 14.9502 21.875 13.7311 21.875 12.5C21.875 11.2689 21.6325 10.0498 21.1614 8.91234C20.6902 7.77492 19.9997 6.74142 19.1291 5.87087C18.2586 5.00032 17.2251 4.30977 16.0877 3.83863C14.9502 3.36749 13.7311 3.125 12.5 3.125C11.2689 3.125 10.0498 3.36749 8.91234 3.83863C7.77492 4.30977 6.74142 5.00032 5.87087 5.87087C5.00032 6.74142 4.30977 7.77492 3.83863 8.91234C3.36749 10.0498 3.125 11.2689 3.125 12.5Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="12.5" r="1" fill={color} />
          <circle cx="12.5" cy="12.5" r="1" fill={color} />
          <circle cx="17.5" cy="12.5" r="1" fill={color} />
        </g>
      </svg>
    )
  }
}
