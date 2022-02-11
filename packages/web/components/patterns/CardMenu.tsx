import type { ReactNode } from 'react'
import { Dropdown, DropdownOption } from '../elements/DropdownElements'
import { LibraryItemNode } from '../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import { isVipUser } from '../../lib/featureFlag'

export type CardMenuDropdownAction =
  | 'mark-read'
  | 'mark-unread'
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'share'
  | 'snooze'

type CardMenuProps = {
  item: LibraryItemNode
  viewer: UserBasicData
  triggerElement: ReactNode
  actionHandler: (action: CardMenuDropdownAction) => void
}

export function CardMenu(props: CardMenuProps): JSX.Element {
  return (
    <Dropdown triggerElement={props.triggerElement}>
      {!props.item.isArchived ? (
        <DropdownOption
          onSelect={() => props.actionHandler('archive')}
          title="Archive"
        />
      ) : (
        <DropdownOption
          onSelect={() => props.actionHandler('unarchive')}
          title="Unarchive"
        />
      )}
      {isVipUser(props.viewer) && (
        <DropdownOption
          onSelect={() => {
            props.actionHandler('snooze')
          }}
          title="Snooze"
        />
      )}
      {/* <DropdownOption
        onSelect={() => {
          props.actionHandler('share')
        }}
        title="Share"
      /> */}
      {props.item.readingProgressPercent < 98 ? (
        <DropdownOption
          onSelect={() => {
            props.actionHandler('mark-read')
          }}
          title="Mark Read"
        />
      ) : (
        <DropdownOption
          onSelect={() => {
            props.actionHandler('mark-unread')
          }}
          title="Mark Unread"
        />
      )}
      <DropdownOption
        onSelect={() => {
          props.actionHandler('delete')
        }}
        title="Remove"
      />
    </Dropdown>
  )
}
