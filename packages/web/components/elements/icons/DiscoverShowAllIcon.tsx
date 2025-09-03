/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { SpanBox } from '../LayoutPrimitives'
import { IconProps } from './IconProps'

import React from 'react'
import { Eye } from "@phosphor-icons/react"

export class DiscoverShowAllIcon extends React.Component<IconProps> {
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
            <Eye size={18} x={11} y={11} color={'var(--inner-color)'} />
        </svg>
      </SpanBox>
  )
  }
  }
