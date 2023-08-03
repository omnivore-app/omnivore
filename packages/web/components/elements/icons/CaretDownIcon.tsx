/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class CaretDownIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 9 9"
        fill="none"
      >
        <g>
          <path
            d="M7.0618 1.19531C7.21941 1.19641 7.37452 1.23475 7.51449 1.30719C7.65446 1.37964 7.77533 1.48414 7.86723 1.61218C7.95913 1.74022 8.01947 1.88817 8.04332 2.04396C8.06717 2.19975 8.05386 2.35898 8.00447 2.50865L7.9818 2.57031L7.96114 2.61231L5.59781 6.68998C5.51439 6.84091 5.39337 6.9677 5.24649 7.05804C5.09961 7.14839 4.93186 7.19921 4.75954 7.20559C4.58721 7.21196 4.41617 7.17366 4.26302 7.09442C4.10986 7.01517 3.9798 6.89766 3.88547 6.75331L3.85114 6.69565L1.48447 2.61231L1.46414 2.57065C1.40411 2.42286 1.3803 2.26285 1.39471 2.10399C1.40912 1.94513 1.46132 1.79202 1.54696 1.65744C1.6326 1.52287 1.74919 1.41073 1.887 1.3304C2.02481 1.25006 2.17984 1.20386 2.33914 1.19565L2.35847 1.19531L2.37847 1.19598L2.3928 1.19531H7.0618Z"
            fill={color}
          />
        </g>
      </svg>
    )
  }
}
