import { ComponentStory, ComponentMeta } from '@storybook/react'
import { OnboardingHighlightInstructions } from '../components/templates/onboarding/OnboardingHighlightInstructions'

export default {
  title: 'Onboarding-Pages/05',
  component: OnboardingHighlightInstructions,
} as ComponentMeta<typeof OnboardingHighlightInstructions>

export const OnboardingPage5Story: ComponentStory<
  typeof OnboardingHighlightInstructions
> = (args: any) => {
  return <OnboardingHighlightInstructions pageNumber={5} />
}
