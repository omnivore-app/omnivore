/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from '../IconProps'

import React from 'react'

export class ArchiveActionIcon extends React.Component<IconProps> {
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
            d="M17.5 11.0002C17.5 10.5581 17.6756 10.1342 17.9882 9.82165C18.3007 9.50909 18.7246 9.3335 19.1667 9.3335H30.8333C31.2754 9.3335 31.6993 9.50909 32.0118 9.82165C32.3244 10.1342 32.5 10.5581 32.5 11.0002C32.5 11.4422 32.3244 11.8661 32.0118 12.1787C31.6993 12.4912 31.2754 12.6668 30.8333 12.6668H19.1667C18.7246 12.6668 18.3007 12.4912 17.9882 12.1787C17.6756 11.8661 17.5 11.4422 17.5 11.0002Z"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.1666 12.6665V20.9998C19.1666 21.4419 19.3422 21.8658 19.6548 22.1783C19.9673 22.4909 20.3913 22.6665 20.8333 22.6665H29.1666C29.6087 22.6665 30.0326 22.4909 30.3451 22.1783C30.6577 21.8658 30.8333 21.4419 30.8333 20.9998V12.6665"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23.3334 16H26.6667"
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
