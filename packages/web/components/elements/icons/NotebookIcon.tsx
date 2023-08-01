/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class NotebookIcon extends React.Component<IconProps> {
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
            d="M9.61198 4.54883V23.2988M6.48698 4.54883H17.9453C18.4978 4.54883 19.0277 4.76832 19.4185 5.15902C19.8092 5.54972 20.0286 6.07963 20.0286 6.63216V19.1322C20.0286 19.6847 19.8092 20.2146 19.4185 20.6053C19.0277 20.996 18.4978 21.2155 17.9453 21.2155H6.48698C6.21071 21.2155 5.94576 21.1057 5.75041 20.9104C5.55506 20.715 5.44531 20.4501 5.44531 20.1738V5.59049C5.44531 5.31423 5.55506 5.04928 5.75041 4.85393C5.94576 4.65858 6.21071 4.54883 6.48698 4.54883Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.7783 8.7168H15.8617"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.7783 12.8828H15.8617"
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
