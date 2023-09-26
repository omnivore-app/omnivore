/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class SharedNoteIcon extends React.Component<IconProps> {
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
            d="M13 22.75H6.5C5.63805 22.75 4.8114 22.4076 4.2019 21.7981C3.59241 21.1886 3.25 20.362 3.25 19.5V6.5C3.25 5.63805 3.59241 4.8114 4.2019 4.2019C4.8114 3.59241 5.63805 3.25 6.5 3.25H19.5C20.362 3.25 21.1886 3.59241 21.7981 4.2019C22.4076 4.8114 22.75 5.63805 22.75 6.5V14.0833"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.3333 23.8327L22.75 18.416"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22.75 23.291V18.416H17.875"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.45453 8.86328H15.9545"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.45453 13.1953H15.9545"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.45453 17.5293H13.7879"
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
