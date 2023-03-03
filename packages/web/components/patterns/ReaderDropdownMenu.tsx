import { ReactNode, useMemo, useState } from 'react'
import { HStack, VStack } from './../elements/LayoutPrimitives'
import {
  Dropdown,
  DropdownOption,
  DropdownSeparator,
} from '../elements/DropdownElements'
import { StyledText } from '../elements/StyledText'
import { Button } from '../elements/Button'
import { currentThemeName } from '../../lib/themeUpdater'
import { Check } from 'phosphor-react'

type DropdownMenuProps = {
  triggerElement: ReactNode
  articleActionHandler: (action: string, arg?: unknown) => void
}

export function ReaderDropdownMenu(props: DropdownMenuProps): JSX.Element {
  return (
    <Dropdown triggerElement={props.triggerElement}>
      <DropdownOption
        onSelect={() => props.articleActionHandler('archive')}
        title="Archive"
      />
      <DropdownOption
        onSelect={() => props.articleActionHandler('editLabels')}
        title="Edit Labels"
      />
      <DropdownOption
        onSelect={() => props.articleActionHandler('showEditModal')}
        title="Edit Info"
      />
      <DropdownOption
        onSelect={() => props.articleActionHandler('delete')}
        title="Delete"
      />
      <DropdownSeparator />
      <DropdownOption
        onSelect={() => window.Intercom('show')}
        title="Feedback"
      />
    </Dropdown>
  )
}
