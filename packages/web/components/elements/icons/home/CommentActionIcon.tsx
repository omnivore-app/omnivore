/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from '../IconProps'

import React from 'react'

export class CommentActionIcon extends React.Component<IconProps> {
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
            d="M17.5 22.6668L18.5833 19.4168C17.647 18.032 17.3083 16.3922 17.6302 14.8021C17.952 13.212 18.9126 11.7799 20.3331 10.772C21.7537 9.76421 23.5377 9.24923 25.3534 9.32285C27.1691 9.39647 28.8929 10.0537 30.2044 11.1723C31.5159 12.2909 32.3257 13.7948 32.4834 15.4043C32.6411 17.0138 32.1358 18.6195 31.0616 19.9228C29.9873 21.226 28.4172 22.1382 26.6432 22.4896C24.8691 22.8411 23.0118 22.6079 21.4167 21.8335L17.5 22.6668Z"
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
