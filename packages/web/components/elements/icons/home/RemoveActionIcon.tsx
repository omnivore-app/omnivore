/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from '../IconProps'

import React from 'react'

export class RemoveActionIcon extends React.Component<IconProps> {
  render() {
    const strokeColor = (this.props.color || '#D9D9D9').toString()

    return (
      <svg
        width="19"
        height="19"
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M3.16699 5.5415H15.8337"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.91699 8.7085V13.4585"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.083 8.7085V13.4585"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.95801 5.5415L4.74967 15.0415C4.74967 15.4614 4.91649 15.8642 5.21342 16.1611C5.51035 16.458 5.91308 16.6248 6.33301 16.6248H12.6663C13.0863 16.6248 13.489 16.458 13.7859 16.1611C14.0829 15.8642 14.2497 15.4614 14.2497 15.0415L15.0413 5.5415"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.125 5.54167V3.16667C7.125 2.9567 7.20841 2.75534 7.35687 2.60687C7.50534 2.45841 7.7067 2.375 7.91667 2.375H11.0833C11.2933 2.375 11.4947 2.45841 11.6431 2.60687C11.7916 2.75534 11.875 2.9567 11.875 3.16667V5.54167"
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
