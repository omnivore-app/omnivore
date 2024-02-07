/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'
import { SpanBox } from '../LayoutPrimitives'

import React from 'react'

export class HeaderCheckboxIcon extends React.Component<IconProps> {
  render() {
    return (
      <SpanBox
        css={{
          display: 'flex',
          '--inner-color': 'white',
          '--ring-color': 'var(--colors-thHeaderIconRing)',
          '&:hover': {
            '--ring-fill': '#007AFF',
            '--ring-color': '#007AFF',
          },
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.5"
            y="0.5"
            width="39"
            height="39"
            rx="19.5"
            style={{
              fill: 'var(--ring-fill)',
              stroke: 'var(--ring-color)',
            }}
          />
          <g>
            <path
              d="M12.5 14.1667C12.5 13.7246 12.6756 13.3007 12.9882 12.9882C13.3007 12.6756 13.7246 12.5 14.1667 12.5H25.8333C26.2754 12.5 26.6993 12.6756 27.0118 12.9882C27.3244 13.3007 27.5 13.7246 27.5 14.1667V25.8333C27.5 26.2754 27.3244 26.6993 27.0118 27.0118C26.6993 27.3244 26.2754 27.5 25.8333 27.5H14.1667C13.7246 27.5 13.3007 27.3244 12.9882 27.0118C12.6756 26.6993 12.5 26.2754 12.5 25.8333V14.1667Z"
              style={{
                stroke: 'var(--inner-color)',
              }}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </SpanBox>
    )
  }
}
