/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { SpanBox } from '../LayoutPrimitives'
import { IconProps } from './IconProps'

import React from 'react'

export class HomeIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    const color = (this.props.color || '#2A2A2A').toString()

    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M19.9329 11.8028L12.7458 5.53907C12.3924 5.23127 11.8662 5.23187 11.514 5.54027L4.35753 11.8043C3.70713 12.3737 4.11003 13.445 4.97433 13.445C5.49123 13.445 5.91033 13.8641 5.91033 14.3813V19.8503C5.91033 20.3675 6.32973 20.7863 6.84663 20.7863H10.1271V15.9932C10.1271 15.7007 10.3638 15.464 10.656 15.464H13.6359C13.9281 15.464 14.1651 15.7007 14.1651 15.9932V20.7866H17.2806C17.7978 20.7866 18.2169 20.3678 18.2169 19.8506V14.3816C18.2169 13.8644 18.636 13.4453 19.1529 13.4453H19.3179C20.1831 13.4447 20.5854 12.3713 19.9329 11.8028Z"
            fill={color}
          />
        </g>
      </svg>
    )
  }
}
