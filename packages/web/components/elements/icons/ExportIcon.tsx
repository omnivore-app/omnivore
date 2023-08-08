/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class ExportIcon extends React.Component<IconProps> {
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
            d="M9.19727 9.54199H8.1556C7.60306 9.54199 7.07316 9.76149 6.68246 10.1522C6.29176 10.5429 6.07227 11.0728 6.07227 11.6253V19.9587C6.07227 20.5112 6.29176 21.0411 6.68246 21.4318C7.07316 21.8225 7.60306 22.042 8.1556 22.042H18.5723C19.1248 22.042 19.6547 21.8225 20.0454 21.4318C20.4361 21.0411 20.6556 20.5112 20.6556 19.9587V11.6253C20.6556 11.0728 20.4361 10.5429 20.0454 10.1522C19.6547 9.76149 19.1248 9.54199 18.5723 9.54199H17.5306"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.3643 14.7503V3.29199"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.2393 6.41699L13.3643 3.29199L16.4893 6.41699"
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
