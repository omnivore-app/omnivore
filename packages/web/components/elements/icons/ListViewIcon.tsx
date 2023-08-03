/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class ListViewIcon extends React.Component<IconProps> {
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
            d="M14.2261 5.89258H22.5594"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.2261 10.0586H19.4344"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.2261 16.3086H22.5594"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.2261 20.4746H19.4344"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.80957 5.89128C3.80957 5.61501 3.91932 5.35006 4.11467 5.15471C4.31002 4.95936 4.57497 4.84961 4.85124 4.84961H9.0179C9.29417 4.84961 9.55912 4.95936 9.75447 5.15471C9.94982 5.35006 10.0596 5.61501 10.0596 5.89128V10.0579C10.0596 10.3342 9.94982 10.5992 9.75447 10.7945C9.55912 10.9899 9.29417 11.0996 9.0179 11.0996H4.85124C4.57497 11.0996 4.31002 10.9899 4.11467 10.7945C3.91932 10.5992 3.80957 10.3342 3.80957 10.0579V5.89128Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.80957 16.3092C3.80957 16.033 3.91932 15.768 4.11467 15.5727C4.31002 15.3773 4.57497 15.2676 4.85124 15.2676H9.0179C9.29417 15.2676 9.55912 15.3773 9.75447 15.5727C9.94982 15.768 10.0596 16.033 10.0596 16.3092V20.4759C10.0596 20.7522 9.94982 21.0171 9.75447 21.2125C9.55912 21.4078 9.29417 21.5176 9.0179 21.5176H4.85124C4.57497 21.5176 4.31002 21.4078 4.11467 21.2125C3.91932 21.0171 3.80957 20.7522 3.80957 20.4759V16.3092Z"
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
