import { ComponentStory, ComponentMeta } from '@storybook/react'
import OnboardingPage1 from '../components/templates/onboarding/01'

export default {
  title: 'Onboarding-Pages/01',
  component: OnboardingPage1,
} as ComponentMeta<typeof OnboardingPage1>

export const OnboardingPage1Story: ComponentStory<typeof OnboardingPage1> = (args: any) => {
  return (
    <OnboardingPage1 />
  )
}
