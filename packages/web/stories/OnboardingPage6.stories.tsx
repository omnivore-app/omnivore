import { ComponentStory, ComponentMeta } from '@storybook/react'
import { OnboardingJoinCommunity } from '../components/templates/onboarding/OnboardingJoinCommunity'

export default {
  title: 'Onboarding-Pages/06',
  component: OnboardingJoinCommunity,
} as ComponentMeta<typeof OnboardingJoinCommunity>

export const OnboardingPage6Story: ComponentStory<typeof OnboardingJoinCommunity> = (args: any) => {
  return (
    <OnboardingJoinCommunity />
  )
}
