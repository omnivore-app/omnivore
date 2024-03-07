/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

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
      return <HeaderCheckboxCheckedIcon size={17} />
    case 'none':
    case 'off':
      return <HeaderCheckboxUncheckedIcon size={17} />
    case 'some':
      return <HeaderCheckboxHalfCheckedIcon size={17} />
  }
}

export class HeaderCheckboxUncheckedIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 21 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M3.479 4.16667C3.479 3.72464 3.6546 3.30072 3.96716 2.98816C4.27972 2.67559 4.70364 2.5 5.14567 2.5H16.8123C17.2544 2.5 17.6783 2.67559 17.9908 2.98816C18.3034 3.30072 18.479 3.72464 18.479 4.16667V15.8333C18.479 16.2754 18.3034 16.6993 17.9908 17.0118C17.6783 17.3244 17.2544 17.5 16.8123 17.5H5.14567C4.70364 17.5 4.27972 17.3244 3.96716 17.0118C3.6546 16.6993 3.479 16.2754 3.479 15.8333V4.16667Z"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              stroke: 'var(--checkbox-color)',
            }}
          />
        </g>
      </svg>
    )
  }
}

export class HeaderCheckboxCheckedIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 21 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M3.479 4.16667C3.479 3.72464 3.6546 3.30072 3.96716 2.98816C4.27972 2.67559 4.70364 2.5 5.14567 2.5H16.8123C17.2544 2.5 17.6783 2.67559 17.9908 2.98816C18.3034 3.30072 18.479 3.72464 18.479 4.16667V15.8333C18.479 16.2754 18.3034 16.6993 17.9908 17.0118C17.6783 17.3244 17.2544 17.5 16.8123 17.5H5.14567C4.70364 17.5 4.27972 17.3244 3.96716 17.0118C3.6546 16.6993 3.479 16.2754 3.479 15.8333V4.16667Z"
            style={{
              stroke: 'var(--checkbox-color)',
            }}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g>
            <path
              d="M7.73877 10.0004L10.0536 12.3152L14.6832 7.68555"
              style={{
                stroke: 'var(--checkbox-color)',
              }}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    )
  }
}

export class HeaderCheckboxHalfCheckedIcon extends React.Component<IconProps> {
  render() {
    const size = (this.props.size || 26).toString()
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 21 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M3.479 4.16667C3.479 3.72464 3.6546 3.30072 3.96716 2.98816C4.27972 2.67559 4.70364 2.5 5.14567 2.5H16.8123C17.2544 2.5 17.6783 2.67559 17.9908 2.98816C18.3034 3.30072 18.479 3.72464 18.479 4.16667V15.8333C18.479 16.2754 18.3034 16.6993 17.9908 17.0118C17.6783 17.3244 17.2544 17.5 16.8123 17.5H5.14567C4.70364 17.5 4.27972 17.3244 3.96716 17.0118C3.6546 16.6993 3.479 16.2754 3.479 15.8333V4.16667Z"
            style={{
              stroke: 'var(--checkbox-color)',
            }}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.979 10L14.979 10"
            style={{
              stroke: 'var(--checkbox-color)',
            }}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  }
}
