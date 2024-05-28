/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from '../IconProps'

import React from 'react'

export class ShareActionIcon extends React.Component<IconProps> {
  render() {
    const strokeColor = (this.props.color || '#D9D9D9').toString()
    const backgroundColor = (this.props.color || '#3D3D3D').toString()

    return (
      <svg
        width="49"
        height="32"
        viewBox="0 0 49 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect y="0.5" width="49" height="31" rx="4" fill={backgroundColor} />
        <g>
          <path
            d="M25.2917 9.6665V12.8332C20.0865 13.647 18.1509 18.207 17.375 22.3332C17.3457 22.4963 21.6374 17.6133 25.2917 17.5832V20.7498L31.625 15.2082L25.2917 9.6665Z"
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
