import React, { ReactNode } from 'react'
import { HStack } from '../elements/LayoutPrimitives'
import { Selected, SettingsMenu } from './SettingsMenu'

type SettingsMenuProps = {
  children?: ReactNode
  selected?: Selected
}

export function SettingsMenuView(props: SettingsMenuProps): JSX.Element {
  return (
    <HStack distribution="start" css={{
      gap: '$3',
      width: '100%',
      p: '$2',
      background: '$grayBase',
      color: '$grayText',
      '@smDown': {
        flexDirection: 'column'
      },
    }}>
      <SettingsMenu selected={props.selected} />
      {props.children}
    </HStack>
  )
}
