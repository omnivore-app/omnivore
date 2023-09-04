/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class CloseIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 26 26`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M10.7441 10.9399L14.9108 15.1066M14.9108 10.9399L10.7441 15.1066"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.8281 3.64844C20.3281 3.64844 22.2031 5.52344 22.2031 13.0234C22.2031 20.5234 20.3281 22.3984 12.8281 22.3984C5.32813 22.3984 3.45312 20.5234 3.45312 13.0234C3.45312 5.52344 5.32813 3.64844 12.8281 3.64844Z"
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
