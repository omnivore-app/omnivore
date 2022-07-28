import { ComponentStory, ComponentMeta } from '@storybook/react'
//import { updateThemeLocally } from '../lib/themeUpdater'
//import { ThemeId } from '../components/tokens/stitches.config'
import { Menu } from '../components/templates/Menu'

export default {
  title: 'Components/Menu',
  component: Menu,
  argTypes: {
    item: {
      description: 'Menu Item',
    },
    action: {
      description: 'Action that fires on click.',
    },
    url: {
      description: 'going to a specific link',
    },
  },
} as ComponentMeta<typeof Menu>

const Template: ComponentStory<typeof Menu> = (args) => (
  <Menu {...args}>{args.items[0]}</Menu>
)

export const MenuStory = Template.bind({})
MenuStory.args = {
  items: [{ name: 'Home' }],
}
