/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class ShortcutFolderClosed extends React.Component<IconProps> {
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
            d="M9.48478 3.43359C9.71374 3.43357 9.93632 3.50899 10.1181 3.64818L10.2223 3.7388L13.041 6.55859H19.9014C20.6985 6.55855 21.4655 6.8631 22.0455 7.40993C22.6254 7.95676 22.9745 8.70454 23.0212 9.50026L23.0265 9.68359V18.0169C23.0265 18.814 22.7219 19.581 22.1751 20.1609C21.6283 20.7409 20.8805 21.09 20.0848 21.1367L19.9014 21.1419H5.31812C4.52102 21.142 3.75404 20.8374 3.17409 20.2906C2.59415 19.7438 2.24509 18.996 2.19832 18.2003L2.19312 18.0169V6.55859C2.19307 5.7615 2.49762 4.99452 3.04445 4.41457C3.59128 3.83463 4.33906 3.48557 5.13478 3.4388L5.31812 3.43359H9.48478Z"
            fill={color}
          />
        </g>
      </svg>
    )
  }
}
