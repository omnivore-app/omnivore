import { ComponentStory, ComponentMeta } from '@storybook/react'
import { OnboardingReaderPreview } from '../components/templates/onboarding/OnboardingReaderPreview'

export default {
  title: 'Onboarding-Pages/01',
  component: OnboardingReaderPreview,
} as ComponentMeta<typeof OnboardingReaderPreview>

export const OnboardingPage1Story: ComponentStory<typeof OnboardingReaderPreview> = (args: any) => {
  return (
    <OnboardingReaderPreview />
  )
}
