import { ComponentStory, ComponentMeta } from '@storybook/react'
import OnboardingLayout from '../components/templates/OnboardingLayout2'

export default {
  title: 'Components/OnboardingLayout',
  component: OnboardingLayout,
  argTypes: {
    pageNumber: {
      description: 'The current page number of the onboarding process',
    },
    title: {
      description: 'The title of the current onboading screen',
    },
    subTitle: {
      description: 'The subtitle of the current onboading screen',
    },
    description: {
      description: 'The description of the current onboading screen',
    },
    children: {
      description: 'The right column on the page',
    },
    image: {
      description: 'The image on the left column on the page',
    },
  },
} as ComponentMeta<typeof OnboardingLayout>

const Template: ComponentStory<typeof OnboardingLayout> = (args) => (
  <OnboardingLayout {...args}>{args.children}</OnboardingLayout>
)

export const OnboardingLayoutStory = Template.bind({})
OnboardingLayoutStory.args = {
  pageNumber: 2,
  title: 'Save links to read later',
  subTitle:
    'Save any link to your library using our apps and browser extensions',
  description: 'Install our apps and browser extensions',
  children: <div>This is where the child is rendered.</div>
}
