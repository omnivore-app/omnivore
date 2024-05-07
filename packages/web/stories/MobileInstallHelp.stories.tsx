import { ComponentStory, ComponentMeta } from '@storybook/react'
import IOSInstallHelp from '../components/elements/IOSInstallHelp'
import { Box } from '../components/elements/LayoutPrimitives'

export default {
  title: 'Components/MobileInstallHelp',
  component: IOSInstallHelp,
  argTypes: {
    onboarding: {
      description:
        'Changes the appearence of the component to match onboarding page designs.',
      control: { type: 'boolean' },
    },
  },
} as ComponentMeta<typeof IOSInstallHelp>

const Template: ComponentStory<typeof IOSInstallHelp> = (args) => (
  <Box
    css={{
      maxWidth: '50rem',
      margin: 'auto',
      marginBottom: '100px',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #0000000F',
      boxShadow: '0px 3px 11px 0px #201F1D0A',
    }}
  >
    <IOSInstallHelp {...args} />
  </Box>
)

export const MobileInstallHelpStory = Template.bind({})
MobileInstallHelpStory.args = {
  onboarding: false,
}

export const OnboardingMobileInstallHelpStory = Template.bind({})
OnboardingMobileInstallHelpStory.args = {
  onboarding: true,
}
