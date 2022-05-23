import { ComponentStory, ComponentMeta } from '@storybook/react'
import OnboardingPage2 from '../components/templates/onboarding/02'

export default {
  title: 'Onboarding-Pages/02',
  component: OnboardingPage2,
} as ComponentMeta<typeof OnboardingPage2>

export const OnboardingPage2Story: ComponentStory<typeof OnboardingPage2> = (args: any) => {
  return (
    <OnboardingPage2 />
  )
}
