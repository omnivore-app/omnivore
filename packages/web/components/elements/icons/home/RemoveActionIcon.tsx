/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from '../IconProps'

import React from 'react'

export class RemoveActionIcon extends React.Component<IconProps> {
  render() {
    const strokeColor = (this.props.color || '#D9D9D9').toString()
    const backgroundColor = (this.props.color || '#3D3D3D').toString()

    return (
      <svg
        width="50"
        height="32"
        viewBox="0 0 50 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="50" height="32" rx="4" fill={backgroundColor} />
        <g>
          <path
            d="M18.3334 11.8335H31.6667"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23.3334 15.1665V20.1665"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M26.6666 15.1665V20.1665"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.1666 11.8335L20 21.8335C20 22.2755 20.1756 22.6994 20.4881 23.012C20.8007 23.3246 21.2246 23.5002 21.6666 23.5002H28.3333C28.7753 23.5002 29.1992 23.3246 29.5118 23.012C29.8244 22.6994 30 22.2755 30 21.8335L30.8333 11.8335"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22.5 11.8333V9.33333C22.5 9.11232 22.5878 8.90036 22.7441 8.74408C22.9004 8.5878 23.1123 8.5 23.3333 8.5H26.6667C26.8877 8.5 27.0996 8.5878 27.2559 8.74408C27.4122 8.90036 27.5 9.11232 27.5 9.33333V11.8333"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  }
}
