import { ComponentStory, ComponentMeta } from '@storybook/react'
import { EditTitleModal } from '../components/templates/homeFeed/EditTitleModal'
import { LibraryItem } from '../lib/networking/queries/useGetLibraryItemsQuery'

export default {
  title: 'Components/EditTitleModal',
  component: EditTitleModal,
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
} as ComponentMeta<typeof EditTitleModal>

export const EditTitleModalStory: ComponentStory<typeof EditTitleModal> = (
  args
) => (
  <EditTitleModal
    onOpenChange={() => {}}
    item={{
      cursor: '',
      node: { title: '', description: '' } as LibraryItem['node'],
    }}
    updateItem={async () => console.log('update item')}
  />
)
