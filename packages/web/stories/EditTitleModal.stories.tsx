import { ComponentStory, ComponentMeta } from '@storybook/react'
import { EditLibraryItemModal } from '../components/templates/homeFeed/EditItemModals'
import { LibraryItem } from '../lib/networking/library_items/useLibraryItems'

export default {
  title: 'Components/EditTitleModal',
  component: EditLibraryItemModal,
  argTypes: {
    onOpenChange: {
      description:
        'This is the function that changes the open and closed state of the modal',
    },
    item: {
      description: 'The article whose title or description is to be changed.',
    },
  },
  parameters: {
    docs: {
      page: null,
    },
    previewTabs: {
      'storybook/docs/panel': { hidden: true },
    },
    viewMode: 'canvas',
  },
} as ComponentMeta<typeof EditLibraryItemModal>

export const EditTitleModalStory: ComponentStory<
  typeof EditLibraryItemModal
> = (args) => (
  <EditLibraryItemModal
    onOpenChange={() => {}}
    item={{
      cursor: '',
      node: { title: '', description: '' } as LibraryItem['node'],
    }}
    updateItem={async () => console.log('update item')}
  />
)
