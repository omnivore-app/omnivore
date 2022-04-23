import { ComponentStory, ComponentMeta } from '@storybook/react'
import { EmptyLibrary } from '../components/templates/homeFeed/EmptyLibrary'

export default {
  title: 'Components/EmptyLibraryStory',
  component: EmptyLibrary,
  argTypes: {
    position: {
      description: 'The empty library component',
      control: { type: 'select' },
    },
  },
} as ComponentMeta<typeof EmptyLibrary>

export const EmptyLibraryStory: ComponentStory<typeof EmptyLibrary> = (args: any) => {
  return (
    <EmptyLibrary onAddLinkClicked={() => {
      console.log('onAddLinkClicked')
    }} />
  )
}
