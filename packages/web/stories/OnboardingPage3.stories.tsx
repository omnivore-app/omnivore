import { ComponentStory, ComponentMeta } from '@storybook/react'
import { OnboardingAddNewsletters } from '../components/templates/onboarding/OnboardingAddNewsletters'

export default {
  title: 'Onboarding-Pages/03',
  component: OnboardingAddNewsletters,
} as ComponentMeta<typeof OnboardingAddNewsletters>

export const OnboardingPage3Story: ComponentStory<typeof OnboardingAddNewsletters> = (args: any) => {
  return (
    <OnboardingAddNewsletters />
  )
}
