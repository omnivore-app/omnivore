import type { ReactNode } from 'react'
import { Dropdown, DropdownOption } from '../elements/DropdownElements'
import {
  LibraryItemNode,
  useUpdateItemReadStatus,
} from '../../lib/networking/library_items/useLibraryItems'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import { State } from '../../lib/networking/fragments/articleFragment'

export type CardMenuDropdownAction =
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'set-labels'
  | 'open-notebook'
  | 'showOriginal'
  | 'unsubscribe'
  | 'editTitle'

type CardMenuProps = {
  item: LibraryItemNode
  viewer: UserBasicData
  triggerElement: ReactNode
  actionHandler: (action: CardMenuDropdownAction) => void
  onOpenChange?: (open: boolean) => void
}

export function CardMenu(props: CardMenuProps): JSX.Element {
  const updateItemReadStatus = useUpdateItemReadStatus()

  return (
    <Dropdown
      triggerElement={props.triggerElement}
      onOpenChange={props.onOpenChange}
      css={{ bg: '$thNavMenuFooter' }}
    >
      {props.item.state != State.ARCHIVED ? (
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
      <DropdownOption
        onSelect={() => {
          props.actionHandler('set-labels')
        }}
        title="Set labels"
      />
      <DropdownOption
        onSelect={() => {
          props.actionHandler('open-notebook')
        }}
        title="Open notebook"
      />
      <DropdownOption
        onSelect={() => props.actionHandler('showOriginal')}
        title="Open original"
      />
      <DropdownOption
        onSelect={() => props.actionHandler('editTitle')}
        title="Edit info"
      />
      {props.item.readingProgressPercent < 98 ? (
        <DropdownOption
          onSelect={async () => {
            await updateItemReadStatus.mutateAsync({
              itemId: props.item.id,
              slug: props.item.slug,
              input: {
                id: props.item.id,
                readingProgressPercent: 100,
                force: true,
              },
            })
          }}
          title="Mark read"
        />
      ) : (
        <DropdownOption
          onSelect={async () => {
            await updateItemReadStatus.mutateAsync({
              itemId: props.item.id,
              slug: props.item.slug,
              input: {
                id: props.item.id,
                readingProgressPercent: 0,
                force: true,
              },
            })
          }}
          title="Mark unread"
        />
      )}
      <DropdownOption
        onSelect={() => {
          props.actionHandler('delete')
        }}
        title="Remove"
      />
      {/* {!!props.item.subscription && (
        <DropdownOption
          onSelect={() => {
            props.actionHandler('unsubscribe')
          }}
          title="Unsubscribe"
        />
      )} */}
    </Dropdown>
  )
}
