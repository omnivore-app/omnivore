/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from '../IconProps'

import React from 'react'

export class AddToLibraryActionIcon extends React.Component<IconProps> {
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
            d="M14.25 5.54167V16.625L9.5 13.4583L4.75 16.625V5.54167C4.75 4.70181 5.08363 3.89636 5.6775 3.3025C6.27136 2.70863 7.07681 2.375 7.91667 2.375H11.0833C11.9232 2.375 12.7286 2.70863 13.3225 3.3025C13.9164 3.89636 14.25 4.70181 14.25 5.54167Z"
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
