import { ReactNode } from 'react'
import {
  Dropdown,
  DropdownOption,
  DropdownSeparator,
} from '../elements/DropdownElements'

type DropdownMenuProps = {
  triggerElement: ReactNode
  articleActionHandler: (action: string, arg?: unknown) => void
}

export function ReaderDropdownMenu(props: DropdownMenuProps): JSX.Element {
  return (
    <Dropdown triggerElement={props.triggerElement}>
      <DropdownOption
        onSelect={() => props.articleActionHandler('archive')}
        title="Archive (e)"
      />
      <DropdownOption
        onSelect={() => props.articleActionHandler('setLabels')}
        title="Edit labels (l)"
      />
      <DropdownOption
        onSelect={() => props.articleActionHandler('showEditModal')}
        title="Edit info (i)"
      />
      <DropdownOption
        onSelect={() => props.articleActionHandler('delete')}
        title="Remove (#)"
      />
      <DropdownSeparator />
      <DropdownOption
        onSelect={() => window.Intercom('show')}
        title="Feedback"
      />
    </Dropdown>
  )
}
