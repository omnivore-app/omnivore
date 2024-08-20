/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class NavMoreButtonUpIcon extends React.Component<IconProps> {
  render() {
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.75 15.1836L12 9.43359L6.25 15.1836"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
}
