/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class FeedFlairIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 17 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M8.73861 3.23242L3.40527 5.89909L8.73861 8.56576L14.0719 5.89909L8.73861 3.23242Z"
            fill="#FF7B03"
            stroke="#FF7B03"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.40527 8.56641L8.73861 11.2331L14.0719 8.56641"
            stroke="#FF7B03"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.40527 11.2324L8.73861 13.8991L14.0719 11.2324"
            stroke="#FF7B03"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  }
}
