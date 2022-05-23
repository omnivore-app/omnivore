import { ComponentStory, ComponentMeta } from '@storybook/react'
import OnboardingPage6 from '../components/templates/onboarding/06'

export default {
  title: 'Onboarding-Pages/06',
  component: OnboardingPage6,
} as ComponentMeta<typeof OnboardingPage6>

export const OnboardingPage6Story: ComponentStory<typeof OnboardingPage6> = (args: any) => {
  return (
    <OnboardingPage6 />
  )
}
