import { ComponentStory, ComponentMeta } from '@storybook/react'
import OnboardingPage3 from '../components/templates/onboarding/03'

export default {
  title: 'Onboarding-Pages/03',
  component: OnboardingPage3,
} as ComponentMeta<typeof OnboardingPage3>

export const OnboardingPage3Story: ComponentStory<typeof OnboardingPage3> = (args: any) => {
  return (
    <OnboardingPage3 />
  )
}
