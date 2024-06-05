/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from '../IconProps'

import React from 'react'

export class ArchiveActionIcon extends React.Component<IconProps> {
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
            d="M2.375 4.74984C2.375 4.32991 2.54181 3.92718 2.83875 3.63025C3.13568 3.33332 3.53841 3.1665 3.95833 3.1665H15.0417C15.4616 3.1665 15.8643 3.33332 16.1613 3.63025C16.4582 3.92718 16.625 4.32991 16.625 4.74984C16.625 5.16976 16.4582 5.57249 16.1613 5.86942C15.8643 6.16636 15.4616 6.33317 15.0417 6.33317H3.95833C3.53841 6.33317 3.13568 6.16636 2.83875 5.86942C2.54181 5.57249 2.375 5.16976 2.375 4.74984Z"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.95801 6.3335V14.2502C3.95801 14.6701 4.12482 15.0728 4.42176 15.3697C4.71869 15.6667 5.12141 15.8335 5.54134 15.8335H13.458C13.8779 15.8335 14.2807 15.6667 14.5776 15.3697C14.8745 15.0728 15.0413 14.6701 15.0413 14.2502V6.3335"
            stroke={strokeColor}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.91699 9.5H11.0837"
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
