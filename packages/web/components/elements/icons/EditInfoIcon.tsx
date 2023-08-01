/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { IconProps } from './IconProps'

import React from 'react'

export class EditInfoIcon extends React.Component<IconProps> {
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
            d="M3.36182 12.8828C3.36182 14.114 3.60431 15.333 4.07545 16.4705C4.54658 17.6079 5.23714 18.6414 6.10769 19.5119C6.97824 20.3825 8.01173 21.073 9.14916 21.5442C10.2866 22.0153 11.5057 22.2578 12.7368 22.2578C13.968 22.2578 15.187 22.0153 16.3245 21.5442C17.4619 21.073 18.4954 20.3825 19.3659 19.5119C20.2365 18.6414 20.927 17.6079 21.3982 16.4705C21.8693 15.333 22.1118 14.114 22.1118 12.8828C22.1118 10.3964 21.1241 8.01184 19.3659 6.25369C17.6078 4.49553 15.2232 3.50781 12.7368 3.50781C10.2504 3.50781 7.86584 4.49553 6.10769 6.25369C4.34954 8.01184 3.36182 10.3964 3.36182 12.8828Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.7368 9.75781H12.7468"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.6953 12.8828H12.737V17.0495H13.7786"
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
