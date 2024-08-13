import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { applyStoredTheme } from '../../lib/themeUpdater'

import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { NavigationLayout } from '../../components/templates/NavigationLayout'

import { Toaster } from 'react-hot-toast'
import {
  Box,
  VStack,
  HStack,
  SpanBox,
  Separator,
} from '../../components/elements/LayoutPrimitives'
import { LabelChip } from '../../components/elements/LabelChip'
import { StyledText } from '../../components/elements/StyledText'
import {
  Subscription,
  SubscriptionType,
  useGetSubscriptionsQuery,
} from '../../lib/networking/queries/useGetSubscriptionsQuery'
import { DragIcon } from '../../components/elements/icons/DragIcon'
import { CoverImage } from '../../components/elements/CoverImage'
import { Label } from '../../lib/networking/fragments/labelFragment'
import { usePersistedState } from '../../lib/hooks/usePersistedState'
import { CheckSquare, Square } from '@phosphor-icons/react'
import { Button } from '../../components/elements/Button'
import { styled } from '@stitches/react'
import { SavedSearch } from '../../lib/networking/fragments/savedSearchFragment'
import { escapeQuotes } from '../../utils/helper'
import { useGetLabels } from '../../lib/networking/labels/useLabels'
import { useGetSavedSearches } from '../../lib/networking/savedsearches/useSavedSearches'
import {
  Shortcut,
  useGetShortcuts,
  useResetShortcuts,
} from '../../lib/networking/shortcuts/useShortcuts'

function flattenShortcuts(shortcuts: Shortcut[]): string[] {
  let result: string[] = []

  for (const shortcut of shortcuts) {
    if (shortcut.type !== 'folder') {
      result.push(shortcut.id)
    }
    if (shortcut.children && shortcut.children?.length > 0) {
      result = result.concat(flattenShortcuts(shortcut.children))
    }
  }

  return result
}

export default function Shortcuts(): JSX.Element {
  const { data: shortcuts, isLoading } = useGetShortcuts()
  const shortcutIds = useMemo(() => {
    if (shortcuts) {
      return flattenShortcuts(shortcuts)
    }
    return []
  }, [shortcuts])

  console.log('shortcutIds: ', shortcutIds)

  return (
    <SettingsLayout>
      {!isLoading &&
        shortcutIds.map((shortcutId) => {
          return <Box key={shortcutId}>{shortcutId}</Box>
        })}
    </SettingsLayout>
  )
}

export const SectionSeparator = styled(Separator, {
  height: '1px',
  my: '30px',
  backgroundColor: '$grayBorder',
})

type ListProps = {
  shortcutIds: string[]
  // dispatchList: (arg: { type: ListAction; item?: Shortcut | undefined }) => void
}

const AvailableItems = (props: ListProps): JSX.Element => {
  const { data: labels } = useGetLabels()
  const { data: savedSearches } = useGetSavedSearches()
  const { subscriptions } = useGetSubscriptionsQuery()

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

  const searchSelected = useCallback(
    (search: SavedSearch) => {
      return !!props.shortcutIds.find((shortcutId) => shortcutId == search.id)
    },
    [props]
  )

  const labelSelected = useCallback(
    (label: Label) => {
      return !!props.shortcutIds.find((shortcutId) => shortcutId == label.id)
    },
    [props]
  )

  const subscriptionSelected = useCallback(
    (subscription: Subscription) => {
      return !!props.shortcutIds.find(
        (shortcutId) => shortcutId == subscription.id
      )
    },
    [props]
  )

  console.log('sortedsavedSearchesL: ', sortedsavedSearches)

  return (
    <VStack
      css={{
        m: '0px',
        gap: '10px',
        width: '100%',
        maxWidth: '400px',
        px: '0px',
        pb: '25px',
      }}
      alignment="start"
      distribution="start"
    >
      {/* <StyledText style="settingsSection">Available items</StyledText> */}
      <SavedSearches {...props} />
      <SectionSeparator />
      {/* 
        <StyledText style="settingsSection">Labels</StyledText>
        {sortedLabels.map((label) => {
          console.log('label: ', label)
          return (
            <Button
              key={`label-${label.id}`}
              style="plainIcon"
              css={{
                display: 'flex',
                width: '100%',
                p: '5px',
                alignItems: 'center',
                borderRadius: '5px',
                '&:hover': {
                  bg: '$thLibrarySelectionColor',
                  color: '$thLibraryMenuSecondary',
                },
              }}
              onClick={(event) => {
                const item: Shortcut = {
                  id: label.id,
                  type: 'label',
                  label: label,
                  section: 'library',
                  name: label.name,
                  filter: `label:\"${escapeQuotes(label.name)}\"`,
                }
                props.dispatchList({
                  item,
                  type: labelSelected(label) ? 'REMOVE_ITEM' : 'ADD_ITEM',
                })

                event.preventDefault()
              }}
            >
              <LabelChip text={label.name} color={label.color} />
              <SpanBox css={{ ml: 'auto' }}>
                {labelSelected(label) ? (
                  <CheckSquare size={20} weight="duotone" />
                ) : (
                  <Square size={20} weight="duotone" />
                )}
              </SpanBox>
            </Button>
          )
        })}
        <SectionSeparator />

        <StyledText style="settingsSection">Subscriptions</StyledText>
        {sortedSubscriptions.map((subscription) => {
          console.log('subscription: ', subscription)
          return (
            <Button
              key={`subscription-${subscription.id}`}
              style="plainIcon"
              css={{
                display: 'flex',
                width: '100%',
                p: '5px',
                alignItems: 'center',
                borderRadius: '5px',
                '&:hover': {
                  bg: '$thLibrarySelectionColor',
                  color: '$thLibraryMenuSecondary',
                },
              }}
              onClick={(event) => {
                const item: Shortcut = {
                  id: subscription.id,
                  section: 'subscriptions',
                  name: subscription.name,
                  icon: subscription.icon,
                  type:
                    subscription.type == SubscriptionType.NEWSLETTER
                      ? 'newsletter'
                      : 'feed',
                  filter:
                    subscription.type == SubscriptionType.NEWSLETTER
                      ? `subscription:\"${escapeQuotes(subscription.name)}\"`
                      : `rss:\"${subscription.url}\"`,
                }
                props.dispatchList({
                  item,
                  type: subscriptionSelected(subscription)
                    ? 'REMOVE_ITEM'
                    : 'ADD_ITEM',
                })

                event.preventDefault()
              }}
            >
              <StyledText style="settingsItem">{subscription.name}</StyledText>
              <SpanBox css={{ ml: 'auto' }}>
                {subscriptionSelected(subscription) ? (
                  <CheckSquare size={20} weight="duotone" />
                ) : (
                  <Square size={20} weight="duotone" />
                )}
              </SpanBox>
            </Button>
          )
        })} */}
    </VStack>
  )
}

const SavedSearches = (props: ListProps) => {
  const { data: savedSearches, isLoading } = useGetSavedSearches()

  const sortedsavedSearches = useMemo(() => {
    if (!savedSearches) {
      return []
    }
    return savedSearches.sort((a, b) =>
      a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
    )
  }, [savedSearches])
  return (
    <>
      {/* <StyledText style="settingsSection">Saved Searches</StyledText> */}
      {/* <Box> */}
      {!isLoading &&
        (savedSearches ?? []).map((search) => {
          return (
            <Box key={`saved-search-${search.id}`} suppressHydrationWarning>
              {search.name}
            </Box>
          )
        })}
      {/* </Box> */}
    </>
  )
}
