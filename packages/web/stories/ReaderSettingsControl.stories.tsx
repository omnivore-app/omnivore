import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Box } from '../components/elements/LayoutPrimitives'
import { ReaderSettingsControl } from '../components/templates/article/ReaderSettingsControl'

export default {
  title: 'Components/ReaderSettingsControl',
  component: ReaderSettingsControl,
  argTypes: {
    position: {
      description: 'The ReaderSettingsControl component',
      control: { type: 'select' },
    },
  },
} as ComponentMeta<typeof ReaderSettingsControl>

export const ReaderSettingsStory: ComponentStory<
  typeof ReaderSettingsControl
> = (args: any) => {
  return (
    <div style={{ width: '245px', border: '2px solid black' }}>
      <ReaderSettingsControl
        articleActionHandler={(action) => {
          console.log('articleActionHandler')
        }}
      />
    </div>
  )
}
