/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class ShortcutFolderOpen extends React.Component<IconProps> {
  render() {
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
            d="M5.24447 20.4395L8.11634 12.7822C8.19075 12.5836 8.32397 12.4126 8.49819 12.2918C8.67241 12.171 8.87934 12.1062 9.09134 12.1061H21.9111M5.24447 20.4395H19.8549C20.3395 20.4393 20.809 20.2702 21.1824 19.9613C21.5558 19.6523 21.8098 19.2228 21.9007 18.7467L22.9382 13.3186C22.963 13.1695 22.955 13.0167 22.9149 12.8709C22.8747 12.7251 22.8032 12.5899 22.7055 12.4745C22.6077 12.3591 22.4861 12.2664 22.3489 12.2028C22.2117 12.1392 22.0623 12.1062 21.9111 12.1061M5.24447 20.4395C4.69193 20.4395 4.16203 20.22 3.77133 19.8293C3.38063 19.4386 3.16113 18.9087 3.16113 18.3561V6.89779C3.16113 6.34525 3.38063 5.81535 3.77133 5.42465C4.16203 5.03395 4.69193 4.81445 5.24447 4.81445H9.41113L12.5361 7.93945H19.8278C20.3803 7.93945 20.9102 8.15895 21.3009 8.54965C21.6916 8.94035 21.9111 9.47025 21.9111 10.0228V12.1061"
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
