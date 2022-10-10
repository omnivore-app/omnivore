import { ComponentStory, ComponentMeta } from '@storybook/react'
import { OnboardingInstallInstructions } from '../components/templates/onboarding/OnboardingInstallInstructions'

export default {
  title: 'Onboarding-Pages/02',
  component: OnboardingInstallInstructions,
} as ComponentMeta<typeof OnboardingInstallInstructions>

export const OnboardingPage2Story: ComponentStory<
  typeof OnboardingInstallInstructions
> = (args: any) => {
  return <OnboardingInstallInstructions pageNumber={2} />
}
