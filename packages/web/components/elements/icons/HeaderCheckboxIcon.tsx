/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'
import { SpanBox } from '../LayoutPrimitives'

import React from 'react'
import { MultiSelectMode } from '../../templates/homeFeed/LibraryHeader'

type HeaderCheckboxIconProps = {
  multiSelectMode: MultiSelectMode
}

export const HeaderCheckboxIcon = (
  props: HeaderCheckboxIconProps
): JSX.Element => {
  switch (props.multiSelectMode) {
    case 'search':
    case 'visible':
      return <HeaderCheckboxCheckedIcon />
    case 'none':
    case 'off':
      return <HeaderCheckboxUncheckedIcon />
    case 'some':
      return <HeaderCheckboxHalfCheckedIcon />
  }
}

export class HeaderCheckboxUncheckedIcon extends React.Component<IconProps> {
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

export class HeaderCheckboxCheckedIcon extends React.Component<IconProps> {
  render() {
    return (
      <SpanBox
        css={{
          display: 'flex',
          '--inner-color': 'var(--colors-thHeaderIconInner)',
          '--ring-color': 'var(--colors-thHeaderIconRing)',
          '&:hover': {
            '--ring-fill': '#007AFF10',
          },
        }}
      >
        <svg
          width="41"
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
              d="M25.9341 11.6667C27.5674 11.6667 28.9007 12.9476 28.9857 14.5601L28.9899 14.7226V25.2776C28.9899 26.9109 27.7091 28.2442 26.0966 28.3292L25.9341 28.3334H15.3791C14.5967 28.3335 13.8442 28.0334 13.2764 27.4951C12.7087 26.9569 12.369 26.2213 12.3274 25.4401L12.3232 25.2776V14.7226C12.3232 13.0892 13.6041 11.7559 15.2166 11.6709L15.3791 11.6667H25.9341ZM23.7457 17.7442C23.5895 17.588 23.3775 17.5003 23.1566 17.5003C22.9356 17.5003 22.7237 17.588 22.5674 17.7442L19.8232 20.4876L18.7457 19.4109L18.6674 19.3417C18.4999 19.2122 18.2894 19.1513 18.0786 19.1714C17.8679 19.1915 17.6726 19.291 17.5326 19.4498C17.3926 19.6087 17.3183 19.8148 17.3247 20.0264C17.3312 20.2381 17.418 20.4393 17.5674 20.5892L19.2341 22.2559L19.3124 22.3251C19.4727 22.4495 19.673 22.5111 19.8755 22.4983C20.078 22.4856 20.2689 22.3994 20.4124 22.2559L23.7457 18.9226L23.8149 18.8442C23.9393 18.6839 24.0009 18.4837 23.9881 18.2812C23.9754 18.0787 23.8892 17.8877 23.7457 17.7442Z"
              fill="#007AFF"
            />
          </g>
        </svg>
      </SpanBox>
    )
  }
}

export class HeaderCheckboxHalfCheckedIcon extends React.Component<IconProps> {
  render() {
    return (
      <SpanBox
        css={{
          display: 'flex',
          '--ring-fill': '#007AFF',

          '--inner-color': '#007AFF',
          '--ring-color': 'var(--colors-thHeaderIconRing)',
          // '&:hover': {
          //   '--inner-color': 'white',
          //   '--ring-color': '#007AFF',
          // },
        }}
      >
        <svg
          width="41"
          height="40"
          viewBox="0 0 41 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1.15625"
            y="0.5"
            width="39"
            height="39"
            rx="19.5"
            stroke="#3D3D3D"
          />
          <g>
            <path
              d="M25.9341 11.6667C27.5674 11.6667 28.9007 12.9476 28.9857 14.5601L28.9899 14.7226V25.2776C28.9899 26.9109 27.7091 28.2442 26.0966 28.3292L25.9341 28.3334H15.3791C14.5967 28.3335 13.8442 28.0334 13.2764 27.4951C12.7087 26.9569 12.369 26.2213 12.3274 25.4401L12.3232 25.2776V14.7226C12.3232 13.0892 13.6041 11.7559 15.2166 11.6709L15.3791 11.6667H25.9341ZM23.7457 17.7442C23.5895 17.588 23.3775 17.5003 23.1566 17.5003C22.9356 17.5003 22.7237 17.588 22.5674 17.7442L19.8232 20.4876L18.7457 19.4109L18.6674 19.3417C18.4999 19.2122 18.2894 19.1513 18.0786 19.1714C17.8679 19.1915 17.6726 19.291 17.5326 19.4498C17.3926 19.6087 17.3183 19.8148 17.3247 20.0264C17.3312 20.2381 17.418 20.4393 17.5674 20.5892L19.2341 22.2559L19.3124 22.3251C19.4727 22.4495 19.673 22.5111 19.8755 22.4983C20.078 22.4856 20.2689 22.3994 20.4124 22.2559L23.7457 18.9226L23.8149 18.8442C23.9393 18.6839 24.0009 18.4837 23.9881 18.2812C23.9754 18.0787 23.8892 17.8877 23.7457 17.7442Z"
              fill="#007AFF"
            />
          </g>
        </svg>

        {/* <svg
          width="41"
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
              fill: '#007AFF',
              stroke: 'var(--ring-color)',
            }}
          />
          <g>
            <path
              d="M25.9341 11.6667C27.5674 11.6667 28.9007 12.9476 28.9857 14.5601L28.9899 14.7226V25.2776C28.9899 26.9109 27.7091 28.2442 26.0966 28.3292L25.9341 28.3334H15.3791C14.5967 28.3335 13.8442 28.0334 13.2764 27.4951C12.7087 26.9569 12.369 26.2213 12.3274 25.4401L12.3232 25.2776V14.7226C12.3232 13.0892 13.6041 11.7559 15.2166 11.6709L15.3791 11.6667H25.9341ZM23.7457 17.7442C23.5895 17.588 23.3775 17.5003 23.1566 17.5003C22.9356 17.5003 22.7237 17.588 22.5674 17.7442L19.8232 20.4876L18.7457 19.4109L18.6674 19.3417C18.4999 19.2122 18.2894 19.1513 18.0786 19.1714C17.8679 19.1915 17.6726 19.291 17.5326 19.4498C17.3926 19.6087 17.3183 19.8148 17.3247 20.0264C17.3312 20.2381 17.418 20.4393 17.5674 20.5892L19.2341 22.2559L19.3124 22.3251C19.4727 22.4495 19.673 22.5111 19.8755 22.4983C20.078 22.4856 20.2689 22.3994 20.4124 22.2559L23.7457 18.9226L23.8149 18.8442C23.9393 18.6839 24.0009 18.4837 23.9881 18.2812C23.9754 18.0787 23.8892 17.8877 23.7457 17.7442Z"
              style={{
                fill: '#007AFF',
                stroke: 'var(--inner-color)',
              }}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg> */}
      </SpanBox>
    )
  }
}
