/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
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
            d="M19.9329 12.3418L12.7458 6.07813C12.3924 5.77033 11.8662 5.77093 11.514 6.07933L4.35753 12.3433C3.70713 12.9127 4.11003 13.984 4.97433 13.984C5.49123 13.984 5.91033 14.4031 5.91033 14.9203V20.3893C5.91033 20.9065 6.32973 21.3253 6.84663 21.3253H10.1271V16.5322C10.1271 16.2397 10.3638 16.003 10.656 16.003H13.6359C13.9281 16.003 14.1651 16.2397 14.1651 16.5322V21.3256H17.2806C17.7978 21.3256 18.2169 20.9068 18.2169 20.3896V14.9206C18.2169 14.4034 18.636 13.9843 19.1529 13.9843H19.3179C20.1831 13.9837 20.5854 12.9103 19.9329 12.3418Z"
            fill={color}
          />
        </g>
      </svg>
    )
  }
}
