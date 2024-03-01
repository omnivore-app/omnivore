/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class HighlightsIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
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
            d="M3.74023 18.8567H7.57357L17.6361 8.79423C18.1444 8.2859 18.43 7.59646 18.43 6.87757C18.43 6.15868 18.1444 5.46923 17.6361 4.9609C17.1277 4.45257 16.4383 4.16699 15.7194 4.16699C15.0005 4.16699 14.3111 4.45257 13.8027 4.9609L3.74023 15.0234V18.8567Z"
            fill="#FFD234"
            stroke="#FFD234"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.8447 5.91931L16.6781 9.75265"
            stroke="#FFD234"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.17773 13.5859L9.01107 17.4193"
            stroke="#FFD234"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.9899 15.0234V18.8568H13.3232L17.1566 15.0234H20.9899Z"
            stroke="#FFD234"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  }
}
