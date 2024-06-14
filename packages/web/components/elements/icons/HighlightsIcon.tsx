/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class HighlightsIcon extends React.Component<IconProps> {
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
        <g>
          <path
            d="M2.91113 18.5169H6.74447L16.807 8.45439C17.3153 7.94606 17.6009 7.25661 17.6009 6.53772C17.6009 5.81883 17.3153 5.12939 16.807 4.62106C16.2986 4.11273 15.6092 3.82715 14.8903 3.82715C14.1714 3.82715 13.482 4.11273 12.9736 4.62106L2.91113 14.6836V18.5169Z"
            fill={color}
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.0153 5.57935L15.8487 9.41268"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.34863 13.2461L8.18197 17.0794"
            stroke={color}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.1611 14.6836V18.5169H12.4944L16.3278 14.6836H20.1611Z"
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
