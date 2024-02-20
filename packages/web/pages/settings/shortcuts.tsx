import { useMemo, useState } from 'react'
import { applyStoredTheme } from '../../lib/themeUpdater'

import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import { useGetSavedSearchQuery } from '../../lib/networking/queries/useGetSavedSearchQuery'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { Toaster } from 'react-hot-toast'
import {
  Box,
  VStack,
  HStack,
  SpanBox,
} from '../../components/elements/LayoutPrimitives'
import { LabelChip } from '../../components/elements/LabelChip'
import { Checkbox } from '@radix-ui/react-checkbox'
import { StyledText } from '../../components/elements/StyledText'
import { useGetSubscriptionsQuery } from '../../lib/networking/queries/useGetSubscriptionsQuery'
import { DragIcon } from '../../components/elements/icons/DragIcon'
import { CoverImage } from '../../components/elements/CoverImage'
import { Label } from '../../lib/networking/fragments/labelFragment'

export default function Shortcuts(): JSX.Element {
  applyStoredTheme()

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <VStack
        css={{ width: '100%', height: '100%' }}
        distribution="start"
        alignment="center"
      >
        <VStack
          css={{
            padding: '24px',
            width: '100%',
            height: '100%',
            gap: '25px',
            minWidth: '300px',
            maxWidth: '880px',
          }}
        >
          <Box
            css={{
              py: '$3',
              display: 'grid',
              width: '100%',
              gridAutoRows: 'auto',
              borderRadius: '6px',
              gridGap: '40px',
              gridTemplateColumns: 'repeat(2, 1fr)',
              '@mdDown': {
                gridTemplateColumns: 'repeat(1, 1fr)',
              },
            }}
          >
            <SelectedItems />
            <AvailableItems />
          </Box>
        </VStack>
      </VStack>
    </SettingsLayout>
  )
}

const AvailableItems = (): JSX.Element => {
  const { labels } = useGetLabelsQuery()
  const { savedSearches } = useGetSavedSearchQuery()
  const { subscriptions } = useGetSubscriptionsQuery()

  console.log('subscriptions:', subscriptions)

  const sortedLabels = useMemo(() => {
    if (!labels) {
      return []
    }
    return labels.sort((a, b) =>
      a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
    )
  }, [labels])

  const sortedSubscriptions = useMemo(() => {
    if (!subscriptions) {
      return []
    }
    return subscriptions.sort((a, b) =>
      a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
    )
  }, [subscriptions])

  const sortedsavedSearches = useMemo(() => {
    if (!savedSearches) {
      return []
    }
    return savedSearches.sort((a, b) =>
      a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
    )
  }, [savedSearches])
  return (
    <VStack
      css={{
        width: '420px',
        py: '30px',
        pl: '28px', // becomes labels have some margin built in
        pr: '30px',
        gap: '15px',
        bg: '$thLeftMenuBackground',
      }}
    >
      <StyledText style="settingsSection">Saved Searches</StyledText>
      {sortedsavedSearches?.map((search) => {
        return (
          <HStack css={{ width: '100%' }} key={`search-${search.id}`}>
            <StyledText style="settingsItem">{search.name}</StyledText>
            <SpanBox css={{ ml: 'auto' }}>
              <input type="checkbox" />
            </SpanBox>
          </HStack>
        )
      })}
      <StyledText style="settingsSection">Labels</StyledText>
      {sortedLabels.map((label) => {
        return (
          <HStack css={{ width: '100%' }} key={`label-${label.id}`}>
            <LabelChip text={label.name} color={label.color} />
            <SpanBox css={{ ml: 'auto' }}>
              <input type="checkbox" />
            </SpanBox>
          </HStack>
        )
      })}
      <StyledText style="settingsSection">Subscriptions</StyledText>
      {sortedSubscriptions.map((subscription) => {
        return (
          <HStack
            css={{ width: '100%' }}
            key={`subscription-${subscription.id}`}
          >
            <StyledText style="settingsItem">{subscription.name}</StyledText>
            <SpanBox css={{ ml: 'auto' }}>
              <input type="checkbox" />
            </SpanBox>
          </HStack>
        )
      })}
    </VStack>
  )
}

export type Shortcut = {
  type: 'search' | 'label' | 'newsletter' | 'feed'

  id: string
  name: string
  filter: string

  icon?: string
  label?: Label
}

const SelectedItems = (): JSX.Element => {
  const shortcuts = [
    {
      id: '12asdfasdf',
      name: 'Omnivore Blog',
      icon: 'https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F052c15c4-ecfd-4d32-87db-13bcac9afad5_512x512.png',
      filter: 'subscription:"Money Talk"',
      type: 'newsletter',
    },
  ]

  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{
        width: '420px',
        py: '30px',
        pl: '28px', // becomes labels have some margin built in
        pr: '30px',
        gap: '15px',
        bg: '$thLeftMenuBackground',
      }}
    >
      <StyledText style="settingsSection">Shortcuts</StyledText>
      {shortcuts.map((shortcut) => {
        return (
          <HStack
            alignment="center"
            distribution="start"
            css={{ width: '100%', gap: '10px' }}
            key={`search-${shortcut.id}`}
          >
            <CoverImage src={shortcut.icon} width={20} height={20} />
            <StyledText style="settingsItem">{shortcut.name}</StyledText>
            <HStack css={{ ml: 'auto' }}>
              <DragIcon />
            </HStack>
          </HStack>
        )
      })}
    </VStack>
  )
}
