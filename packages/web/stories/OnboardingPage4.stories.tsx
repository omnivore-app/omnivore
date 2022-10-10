import { ComponentStory, ComponentMeta } from '@storybook/react'
import { OnboardingOrganizeInstructions } from '../components/templates/onboarding/OnboardingOrganizeInstructions'

export default {
  title: 'Onboarding-Pages/04',
  component: OnboardingOrganizeInstructions,
} as ComponentMeta<typeof OnboardingOrganizeInstructions>

export const OnboardingPage4Story: ComponentStory<
  typeof OnboardingOrganizeInstructions
> = (args: any) => {
  return <OnboardingOrganizeInstructions pageNumber={4} />
}
