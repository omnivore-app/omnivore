import { ComponentStory, ComponentMeta } from '@storybook/react'
//import { updateThemeLocally } from '../lib/themeUpdater'
//import { ThemeId } from '../components/tokens/stitches.config'
import { Menubar } from '../components/templates/Menu'

export default {
  title: 'Components/Menu',
  component: Menubar,
} as ComponentMeta<typeof Menubar>

const Template: ComponentStory<typeof Menubar> = () => (
  <Menubar/>
)

export const MenuStory = Template.bind({})

