/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { SpanBox } from '../LayoutPrimitives'
import { IconProps } from './IconProps'

import React from 'react'

export class HeaderToggleGridIcon extends React.Component<IconProps> {
  render() {
    return (
      <SpanBox
        css={{
          display: 'flex',
          '--inner-color': 'var(--colors-thHeaderIconInner)',
          '--ring-color': 'var(--colors-thHeaderIconRing)',
          '&:hover': {
            '--inner-color': 'white',
            '--ring-fill': '#007AFF',
            '--ring-color': '#007AFF',
          },
        }}
      >
        <svg
          width="38"
          height="38"
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
              d="M13.3333 14.1654C13.3333 13.9444 13.4211 13.7324 13.5774 13.5761C13.7337 13.4198 13.9457 13.332 14.1667 13.332H17.5C17.721 13.332 17.933 13.4198 18.0893 13.5761C18.2455 13.7324 18.3333 13.9444 18.3333 14.1654V17.4987C18.3333 17.7197 18.2455 17.9317 18.0893 18.088C17.933 18.2442 17.721 18.332 17.5 18.332H14.1667C13.9457 18.332 13.7337 18.2442 13.5774 18.088C13.4211 17.9317 13.3333 17.7197 13.3333 17.4987V14.1654Z"
              style={{
                stroke: 'var(--inner-color)',
              }}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.6667 14.1654C21.6667 13.9444 21.7545 13.7324 21.9107 13.5761C22.067 13.4198 22.279 13.332 22.5 13.332H25.8333C26.0543 13.332 26.2663 13.4198 26.4226 13.5761C26.5789 13.7324 26.6667 13.9444 26.6667 14.1654V17.4987C26.6667 17.7197 26.5789 17.9317 26.4226 18.088C26.2663 18.2442 26.0543 18.332 25.8333 18.332H22.5C22.279 18.332 22.067 18.2442 21.9107 18.088C21.7545 17.9317 21.6667 17.7197 21.6667 17.4987V14.1654Z"
              style={{
                stroke: 'var(--inner-color)',
              }}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.3333 22.5013C13.3333 22.2803 13.4211 22.0683 13.5774 21.912C13.7337 21.7558 13.9457 21.668 14.1667 21.668H17.5C17.721 21.668 17.933 21.7558 18.0893 21.912C18.2455 22.0683 18.3333 22.2803 18.3333 22.5013V25.8346C18.3333 26.0556 18.2455 26.2676 18.0893 26.4239C17.933 26.5802 17.721 26.668 17.5 26.668H14.1667C13.9457 26.668 13.7337 26.5802 13.5774 26.4239C13.4211 26.2676 13.3333 26.0556 13.3333 25.8346V22.5013Z"
              style={{
                stroke: 'var(--inner-color)',
              }}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.6667 22.5013C21.6667 22.2803 21.7545 22.0683 21.9107 21.912C22.067 21.7558 22.279 21.668 22.5 21.668H25.8333C26.0543 21.668 26.2663 21.7558 26.4226 21.912C26.5789 22.0683 26.6667 22.2803 26.6667 22.5013V25.8346C26.6667 26.0556 26.5789 26.2676 26.4226 26.4239C26.2663 26.5802 26.0543 26.668 25.8333 26.668H22.5C22.279 26.668 22.067 26.5802 21.9107 26.4239C21.7545 26.2676 21.6667 26.0556 21.6667 25.8346V22.5013Z"
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
