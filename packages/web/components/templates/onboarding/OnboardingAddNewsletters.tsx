import React, { useState } from 'react'
import { subscribeMutation } from '../../../lib/networking/mutations/subscribeMutation'
import { VStack } from '../../elements/LayoutPrimitives'
import { OnboardingLayout } from '../OnboardingLayout'
import { SelectOption } from './SelectOption'

const newsletterOptions = [
  {
    icon: 'AxiosDaily.png',
    label: 'Axios Daily Essentials',
    description:
      'Start and end your day with the stories that matter in your inbox.',
    name: 'axios_essentials',
    isChecked: false,
  },
  {
    icon: 'MilkRoad.png',
    label: 'Milk Road',
    description:
      '5 minute daily newsletter. Used by 100,000+ people to be better crypto investors 💪',
    name: 'morning_brew',
    isChecked: false,
  },
  {
    icon: 'MoneyStuff.png',
    label: 'Money Stuff by Matt Levine',
    description:
      'A daily take on Wall Street, finance, companies and other stuff.',
    name: 'milk_road',
    isChecked: false,
  },
  {
    icon: 'OmnivoreBlog.png',
    label: 'Omnivore',
    description: 'Tips and tricks, plus updates on new features in Omnivore.',
    name: 'omnivore_blog',
    isChecked: false,
  },
]

type OnboardingAddNewslettersProps = {
  pageNumber: number
}

export type NewsLetterOption = {
  icon: string
  label: string
  name: string
  description: string
  isChecked: boolean
}

export const OnboardingAddNewsletters = (
  props: OnboardingAddNewslettersProps
) => {
  const [newsletters, setNewsletters] =
    useState<NewsLetterOption[]>(newsletterOptions)

  const onCheck = (index: number) => {
    const temp = [...newsletters]
    temp[index].isChecked = !temp[index].isChecked
    setNewsletters(temp)
  }

  const onNext = () => {
    newsletters.map((newsletter) => {
      if (newsletter.isChecked) subscribeMutation(newsletter.name)
    })
  }

  return (
    <OnboardingLayout
      pageNumber={props.pageNumber}
      subTitle="Omnivore creates an email address for you to subscribe to newsletters with."
      description="Subscribe to some newsletters now"
      title="Read all your Newsletters in Omnivore"
      onNext={onNext}
    >
      <VStack
        css={{
          marginTop: '$4',
          width: '100%',
        }}
      >
        {newsletters.map(({ icon, label, description, isChecked }, idx) => (
          <SelectOption
            key={idx}
            indexNum={idx}
            onCheck={onCheck}
            {...{ icon, label, description, isChecked }}
          />
        ))}
      </VStack>
    </OnboardingLayout>
  )
}
