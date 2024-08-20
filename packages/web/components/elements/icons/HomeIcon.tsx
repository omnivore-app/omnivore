/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { SpanBox } from '../LayoutPrimitives'
import { IconProps } from './IconProps'

import React from 'react'

export class HomeIcon extends React.Component<IconProps> {
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
            d="M19.6026 10.7825L12.0964 4.24071C11.7273 3.91924 11.1778 3.91987 10.8099 4.24196L3.33566 10.7841C2.65639 11.3788 3.07717 12.4976 3.97985 12.4976C4.5197 12.4976 4.95741 12.9354 4.95741 13.4755V19.1873C4.95741 19.7275 5.39543 20.1649 5.93528 20.1649H9.36144V15.159C9.36144 14.8535 9.60865 14.6063 9.91383 14.6063H13.026C13.3312 14.6063 13.5787 14.8535 13.5787 15.159V20.1652H16.8326C17.3727 20.1652 17.8104 19.7278 17.8104 19.1877V13.4758C17.8104 12.9357 18.2482 12.498 18.788 12.498H18.9603C19.8639 12.4973 20.2841 11.3763 19.6026 10.7825Z"
            fill={color}
          />
        </g>
      </svg>
    )
  }
}
