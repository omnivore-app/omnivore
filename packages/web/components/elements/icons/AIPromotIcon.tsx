/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class AIPromptIcon extends React.Component<IconProps> {
  render() {
    return (
      <svg
        width="31"
        height="30"
        viewBox="0 0 31 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.757812"
          width="30"
          height="30"
          rx="15"
          fill="#D0A3FF"
          fillOpacity="0.1"
        />
        <rect
          x="1.25781"
          y="0.5"
          width="29"
          height="29"
          rx="14.5"
          stroke="#D0A3FF"
          strokeOpacity="0.3"
        />
        <g>
          <path
            d="M11.0911 11.667L14.4244 15.0003L11.0911 18.3337"
            stroke="#D0A3FF"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.7578 19.667H20.4245"
            stroke="#D0A3FF"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  }
}
