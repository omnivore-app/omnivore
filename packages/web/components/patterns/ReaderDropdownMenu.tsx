import { ReactNode } from 'react'
import {
  Dropdown,
  DropdownOption,
  DropdownSeparator,
} from '../elements/DropdownElements'
import { ArticleAttributes } from '../../lib/networking/library_items/useLibraryItems'
import { State } from '../../lib/networking/fragments/articleFragment'

type DropdownMenuProps = {
  triggerElement: ReactNode
  libraryItem?: ArticleAttributes
  articleActionHandler: (action: string, arg?: unknown) => void
}

export function ReaderDropdownMenu(props: DropdownMenuProps): JSX.Element {
  return (
    <Dropdown triggerElement={props.triggerElement}>
      <DropdownOption
        onSelect={async () => {
          if (props.libraryItem?.state === State.ARCHIVED) {
            props.articleActionHandler('unarchive')
          } else {
            props.articleActionHandler('archive')
          }
        }}
        title={
          props.libraryItem?.state === State.ARCHIVED
            ? 'Unarchive (e)'
            : 'Archive (e)'
        }
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
        onSelect={async () => {
          props.articleActionHandler('delete')
        }}
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
