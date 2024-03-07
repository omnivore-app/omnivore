/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { SpanBox } from '../LayoutPrimitives'
import { IconProps } from './IconProps'

import React from 'react'

export class HeaderSearchIcon extends React.Component<IconProps> {
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
              d="M12.5 18.3333C12.5 19.0994 12.6509 19.8579 12.944 20.5657C13.2372 21.2734 13.6669 21.9164 14.2085 22.4581C14.7502 22.9998 15.3933 23.4295 16.101 23.7226C16.8087 24.0158 17.5673 24.1667 18.3333 24.1667C19.0994 24.1667 19.8579 24.0158 20.5657 23.7226C21.2734 23.4295 21.9164 22.9998 22.4581 22.4581C22.9998 21.9164 23.4295 21.2734 23.7226 20.5657C24.0158 19.8579 24.1667 19.0994 24.1667 18.3333C24.1667 17.5673 24.0158 16.8087 23.7226 16.101C23.4295 15.3933 22.9998 14.7502 22.4581 14.2085C21.9164 13.6669 21.2734 13.2372 20.5657 12.944C19.8579 12.6509 19.0994 12.5 18.3333 12.5C17.5673 12.5 16.8087 12.6509 16.101 12.944C15.3933 13.2372 14.7502 13.6669 14.2085 14.2085C13.6669 14.7502 13.2372 15.3933 12.944 16.101C12.6509 16.8087 12.5 17.5673 12.5 18.3333Z"
              style={{
                stroke: 'var(--inner-color)',
              }}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M27.5 27.5L22.5 22.5"
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
