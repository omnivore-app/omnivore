/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class NewsletterIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 20).toString()

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M14.6666 5.02332V11.3333C14.6666 11.8435 14.4717 12.3343 14.1217 12.7055C13.7718 13.0767 13.2932 13.3001 12.7839 13.33L12.6666 13.3333H3.33325C2.82311 13.3333 2.33224 13.1384 1.96108 12.7885C1.58991 12.4385 1.36651 11.9599 1.33659 11.4506L1.33325 11.3333V5.02332L7.62992 9.22132L7.70725 9.26532C7.79839 9.30984 7.89849 9.33299 7.99992 9.33299C8.10135 9.33299 8.20145 9.30984 8.29259 9.26532L8.36992 9.22132L14.6666 5.02332Z"
            fill="#007AFF"
          />
          <path
            d="M12.6665 2.66669C13.3865 2.66669 14.0179 3.04669 14.3699 3.61802L7.99988 7.86469L1.62988 3.61802C1.79704 3.34653 2.02669 3.11895 2.29969 2.95428C2.57268 2.7896 2.8811 2.69259 3.19922 2.67135L3.33322 2.66669H12.6665Z"
            fill="#007AFF"
          />
        </g>
      </svg>
    )
  }
}
