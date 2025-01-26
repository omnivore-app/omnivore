/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { SpanBox } from '../LayoutPrimitives'
import { IconProps } from './IconProps'

import React from 'react'

export class HeaderToggleListIcon extends React.Component<IconProps> {
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
              d="M13.3334 14.9987C13.3334 14.5567 13.509 14.1327 13.8215 13.8202C14.1341 13.5076 14.558 13.332 15 13.332H25C25.4421 13.332 25.866 13.5076 26.1786 13.8202C26.4911 14.1327 26.6667 14.5567 26.6667 14.9987V16.6654C26.6667 17.1074 26.4911 17.5313 26.1786 17.8439C25.866 18.1564 25.4421 18.332 25 18.332H15C14.558 18.332 14.1341 18.1564 13.8215 17.8439C13.509 17.5313 13.3334 17.1074 13.3334 16.6654V14.9987Z"
              style={{
                stroke: 'var(--inner-color)',
              }}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.3334 23.3346C13.3334 22.8926 13.509 22.4687 13.8215 22.1561C14.1341 21.8436 14.558 21.668 15 21.668H25C25.4421 21.668 25.866 21.8436 26.1786 22.1561C26.4911 22.4687 26.6667 22.8926 26.6667 23.3346V25.0013C26.6667 25.4433 26.4911 25.8673 26.1786 26.1798C25.866 26.4924 25.4421 26.668 25 26.668H15C14.558 26.668 14.1341 26.4924 13.8215 26.1798C13.509 25.8673 13.3334 25.4433 13.3334 25.0013V23.3346Z"
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
