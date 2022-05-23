import React from 'react'
import { VStack } from '../../elements/LayoutPrimitives'
import { OnboardingLayout } from '../OnboardingLayout'
import { SelectOption } from './SelectOption'

const optionDetails = [
  {
    icon: 'TempleTelegram',
    label: 'Temple Daily Telegram - Temple, Tx',
  },
  {
    icon: 'NYTNewsletter',
    label: 'Newsletters - The New York Times',
  },
  {
    icon: 'NYT',
    label: 'NYT’s The Morning',
  },
  {
    icon: 'BBCNews',
    label: 'London - BBC News',
  },
  {
    icon: 'WashingtonDiplomat',
    label: 'Washington Diplomat - Washington, Dc',
  },
  {
    icon: 'Columbia',
    label: 'The State - Columbia, Sc',
  },
]

const OnboardingPage3 = () => {
  return (
    <OnboardingLayout
      subTitle="Omnivore creates an email address for you to subscribe to newsletters with."
      description="Subscribe to some newsletters now"
      title="Read all your Newsletters in Omnivore"
      pageNumber={3}
      nextPage={'/onboarding/05'}
    >
      <VStack css={{
        marginTop: '$4',
        width: '100%'
      }}>
        {optionDetails.map(({ icon, label }, idx) => (
          <SelectOption key={idx} {...{ icon, label }} />
        ))}
      </VStack>
    </OnboardingLayout>
  )
}

export default OnboardingPage3
