/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class MoveToInboxIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()
    return (
      <svg
        width="21"
        height="21"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M13.125 8.75V18.375L8.75 15.75L4.375 18.375V8.75C4.375 8.05381 4.65156 7.38613 5.14384 6.89384C5.63613 6.40156 6.30381 6.125 7 6.125H10.5C11.1962 6.125 11.8639 6.40156 12.3562 6.89384C12.8484 7.38613 13.125 8.05381 13.125 8.75Z"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.625 2.625H14C14.6962 2.625 15.3639 2.90156 15.8562 3.39384C16.3484 3.88613 16.625 4.55381 16.625 5.25V14.875"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  }
}
