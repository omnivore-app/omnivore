import { ComponentStory, ComponentMeta } from '@storybook/react'
import OnboardingPage5 from '../components/templates/onboarding/05'

export default {
  title: 'Onboarding-Pages/05',
  component: OnboardingPage5,
} as ComponentMeta<typeof OnboardingPage5>

export const OnboardingPage5Story: ComponentStory<typeof OnboardingPage5> = (args: any) => {
  return (
    <OnboardingPage5 />
  )
}
