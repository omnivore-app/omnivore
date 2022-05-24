import React from 'react'
import { VStack } from '../../elements/LayoutPrimitives'
import { OnboardingLayout } from '../OnboardingLayout'
import { SelectOption } from './SelectOption'

const optionDetails = [
  {
    icon: 'AxiosDaily.png',
    label: 'Axios Daily Essentials',
    description: 'Start and end your day with the stories that matter in your inbox.'
  },
  {
    icon: 'MilkRoad.png',
    label: 'Milk Road',
    description: '5 minute daily newsletter. Used by 100,000+ people to be better crypto investors 💪',
  },
  {
    icon: 'MoneyStuff.png',
    label: 'Money Stuff by Matt Levine',
    description: 'A daily take on Wall Street, finance, companies and other stuff.',
  },
  {
    icon: 'OmnivoreBlog.png',
    label: 'Omnivore',
    description: 'Tips and tricks, plus updates on new features in Omnivore.',
  },
]

type OnboardingAddNewslettersProps = {
  pageNumber: number
}

export const OnboardingAddNewsletters = (props: OnboardingAddNewslettersProps) => {
  return (
    <OnboardingLayout
      pageNumber={props.pageNumber}
      subTitle="Omnivore creates an email address for you to subscribe to newsletters with."
      description="Subscribe to some newsletters now"
      title="Read all your Newsletters in Omnivore"
    >
      <VStack css={{
        marginTop: '$4',
        width: '100%'
      }}>
        {optionDetails.map(({ icon, label, description }, idx) => (
          <SelectOption key={idx} {...{ icon, label, description }} />
        ))}
      </VStack>
    </OnboardingLayout>
  )
}

