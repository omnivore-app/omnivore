import { ComponentStory, ComponentMeta } from '@storybook/react'
import OnboardingPage4 from '../components/templates/onboarding/04'

export default {
  title: 'Onboarding-Pages/04',
  component: OnboardingPage4,
} as ComponentMeta<typeof OnboardingPage4>

export const OnboardingPage4Story: ComponentStory<typeof OnboardingPage4> = (args: any) => {
  return (
    <OnboardingPage4 />
  )
}
