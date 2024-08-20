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
        width="20"
        height="21"
        viewBox="0 0 20 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M2.5 17.1668L3.58333 13.9168C2.64704 12.532 2.30833 10.8922 2.63018 9.30207C2.95204 7.71197 3.91255 6.27987 5.33314 5.27204C6.75373 4.26421 8.53772 3.74923 10.3534 3.82285C12.1691 3.89647 13.8929 4.55368 15.2044 5.67228C16.5159 6.79089 17.3257 8.29477 17.4834 9.9043C17.6411 11.5138 17.1358 13.1195 16.0616 14.4228C14.9873 15.726 13.4172 16.6382 11.6432 16.9896C9.86911 17.3411 8.01184 17.1079 6.41667 16.3335L2.5 17.1668Z"
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
