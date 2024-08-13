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
import { CheckSquare, Square, Tag } from '@phosphor-icons/react'
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
  useSetShortcuts,
} from '../../lib/networking/shortcuts/useShortcuts'
import * as Switch from '@radix-ui/react-switch'
import { useGetSubscriptions } from '../../lib/networking/subscriptions/useGetSubscriptions'
import { NewsletterIcon } from '../../components/elements/icons/NewsletterIcon'
import { FollowingIcon } from '../../components/elements/icons/FollowingIcon'
import { LIBRARY_LEFT_MENU_WIDTH } from '../../components/templates/navMenu/NavigationMenu'

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

function removeShortcutById(
  shortcuts: Shortcut[] | undefined,
  targetId: string
): Shortcut[] | undefined {
  if (!shortcuts) {
    return undefined
  }
  return shortcuts
    .filter((shortcut) => shortcut.id !== targetId)
    .map((shortcut) => ({
      ...shortcut,
      children: removeShortcutById(shortcut.children, targetId),
    }))
}

type ListAction = 'RESET' | 'ADD_ITEM' | 'REMOVE_ITEM'

export default function Shortcuts(): JSX.Element {
  const { data, isLoading } = useGetShortcuts()
  const setShortcuts = useSetShortcuts()

  const listReducer = (
    state: { state: string; items: Shortcut[] },
    action: {
      type: ListAction
      item?: Shortcut
      items?: Shortcut[]
    }
  ) => {
    switch (action.type) {
      case 'RESET': {
        return { state: 'CURRENT', items: action.items ?? [] }
      }
      case 'ADD_ITEM': {
        const item = action.item
        if (!item) {
          return state
        }
        const existing = state.items.find(
          (existing) => existing.type == item.type && existing.id == item.id
        )
        if (existing) {
          return state
        }
        state.items.push(item)
        setShortcuts.mutate({
          shortcuts: [...state.items],
        })
        return { state: 'CURRENT', items: [...state.items] }
      }
      case 'REMOVE_ITEM': {
        const item = action.item
        console.log('removing item: ', item)
        if (!item) {
          return state
        }
        const updated = removeShortcutById(state.items, item.id) ?? []
        setShortcuts.mutate({
          shortcuts: [...updated],
        })
        return { state: 'CURRENT', items: [...updated] }
      }
      default:
        throw new Error('unknown action')
    }
  }

  const [shortcuts, dispatchList] = useReducer(listReducer, {
    state: 'INITIAL',
    items: [],
  })

  const shortcutIds = useMemo(() => {
    if (shortcuts.items) {
      return flattenShortcuts(shortcuts.items)
    }
    return []
  }, [shortcuts.items])

  useEffect(() => {
    if (!isLoading) {
      console.log('data: ', data)
      dispatchList({ type: 'RESET', items: data })
    }
  }, [data])

  return (
    <SettingsLayout>
      <VStack
        css={{
          p: '25px',
          width: '100%',
          gap: '40px',
          maxWidth: '400px',
        }}
      >
        <SavedSearches shortcutIds={shortcutIds} dispatchList={dispatchList} />
        <Subscriptions shortcutIds={shortcutIds} dispatchList={dispatchList} />
        <Labels shortcutIds={shortcutIds} dispatchList={dispatchList} />
      </VStack>
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
  dispatchList: (arg: { type: ListAction; item?: Shortcut | undefined }) => void
}

const SavedSearches = (props: ListProps) => {
  const { data: savedSearches, isLoading } = useGetSavedSearches()

  const sortedsavedSearches = useMemo(() => {
    if (!savedSearches) {
      return []
    }
    return (
      savedSearches
        // .filter((search) => props.shortcutIds.indexOf(search.id) === -1)
        .sort((a, b) =>
          a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
        )
    )
  }, [props, savedSearches])

  const isChecked = useCallback(
    (shortcutId: string) => {
      return props.shortcutIds.indexOf(shortcutId) !== -1
    },
    [props.shortcutIds]
  )

  return (
    <VStack distribution="start" alignment="start" css={{ width: '100%' }}>
      <StyledText style="settingsSection">Saved Searches</StyledText>
      <Box css={{ width: '100%' }}>
        {!isLoading &&
          (sortedsavedSearches ?? []).map((search) => {
            return (
              <HStack
                key={`saved-search-${search.id}`}
                distribution="start"
                css={{ width: '100%', gap: '10px' }}
              >
                {search.name}
                <SpanBox css={{ marginLeft: 'auto' }}>
                  <SwitchBox
                    checked={isChecked(search.id)}
                    setChecked={(checked) => {
                      if (checked) {
                        props.dispatchList({
                          type: 'ADD_ITEM',
                          item: {
                            id: search.id,
                            type: 'search',
                            name: search.name,
                            section: 'library',
                            filter: search.filter,
                          },
                        })
                      } else {
                        props.dispatchList({
                          type: 'REMOVE_ITEM',
                          item: {
                            type: 'search',
                            section: 'library',
                            ...search,
                          },
                        })
                      }
                    }}
                  />
                </SpanBox>
              </HStack>
            )
          })}
      </Box>
    </VStack>
  )
}

const Subscriptions = (props: ListProps) => {
  const { data: subscriptions, isLoading } = useGetSubscriptions({})

  const sortedSubscriptions = useMemo(() => {
    if (!subscriptions) {
      return []
    }
    return subscriptions.sort((a, b) =>
      a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
    )
  }, [props, subscriptions])

  const isChecked = useCallback(
    (shortcutId: string) => {
      return props.shortcutIds.indexOf(shortcutId) !== -1
    },
    [props.shortcutIds]
  )

  return (
    <VStack distribution="start" alignment="start" css={{ width: '100%' }}>
      <StyledText style="settingsSection">Subscriptions</StyledText>
      <Box css={{ width: '100%' }}>
        {!isLoading &&
          (sortedSubscriptions ?? []).map((subscription) => {
            return (
              <HStack
                key={`subscription-${subscription.id}`}
                distribution="start"
                alignment="center"
                css={{ width: '100%', gap: '5px' }}
              >
                {subscription.icon ? (
                  <CoverImage
                    src={subscription.icon}
                    width={20}
                    height={20}
                    css={{ borderRadius: '20px' }}
                  />
                ) : subscription.type == SubscriptionType.NEWSLETTER ? (
                  <NewsletterIcon color="#F59932" size={18} />
                ) : (
                  <FollowingIcon color="#F59932" size={21} />
                )}
                {subscription.name}
                <SpanBox css={{ marginLeft: 'auto' }}>
                  <SwitchBox
                    checked={isChecked(subscription.id)}
                    setChecked={(checked) => {
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
                            ? `subscription:\"${escapeQuotes(
                                subscription.name
                              )}\"`
                            : `rss:\"${subscription.url}\"`,
                      }
                      if (checked) {
                        props.dispatchList({
                          type: 'ADD_ITEM',
                          item,
                        })
                      } else {
                        props.dispatchList({
                          type: 'REMOVE_ITEM',
                          item,
                        })
                      }
                    }}
                  />
                </SpanBox>
              </HStack>
            )
          })}
      </Box>
    </VStack>
  )
}

const Labels = (props: ListProps) => {
  const { data: labels, isLoading } = useGetLabels()

  const sortedLabels = useMemo(() => {
    if (!labels) {
      return []
    }
    return labels.sort((a, b) =>
      a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
    )
  }, [props, labels])

  const isChecked = useCallback(
    (shortcutId: string) => {
      return props.shortcutIds.indexOf(shortcutId) !== -1
    },
    [props.shortcutIds]
  )

  return (
    <VStack distribution="start" alignment="start" css={{ width: '100%' }}>
      <StyledText style="settingsSection">Labels</StyledText>
      <Box css={{ width: '100%' }}>
        {!isLoading &&
          (sortedLabels ?? []).map((label) => {
            return (
              <HStack
                key={`label-${label.id}`}
                distribution="start"
                alignment="center"
                css={{ width: '100%', gap: '5px' }}
              >
                <Tag size={15} color={label.color ?? 'gray'} weight="fill" />
                <StyledText style="settingsItem" css={{ pb: '1px' }}>
                  {label.name}
                </StyledText>
                <SpanBox css={{ marginLeft: 'auto' }}>
                  <SwitchBox
                    checked={isChecked(label.id)}
                    setChecked={(checked) => {
                      const item: Shortcut = {
                        id: label.id,
                        type: 'label',
                        label: label,
                        section: 'library',
                        name: label.name,
                        filter: `label:\"${escapeQuotes(label.name)}\"`,
                      }
                      if (checked) {
                        props.dispatchList({
                          type: 'ADD_ITEM',
                          item,
                        })
                      } else {
                        props.dispatchList({
                          type: 'REMOVE_ITEM',
                          item,
                        })
                      }
                    }}
                  />
                </SpanBox>
              </HStack>
            )
          })}
      </Box>
    </VStack>
  )
}

type SwitchBoxProps = {
  checked: boolean
  setChecked: (checked: boolean) => void
}
const SwitchBox = (props: SwitchBoxProps) => {
  return (
    <SwitchRoot
      id="justify-text"
      checked={props.checked}
      onCheckedChange={(checked) => {
        props.setChecked(checked)
      }}
    >
      <SwitchThumb />
    </SwitchRoot>
  )
}

const SwitchRoot = styled(Switch.Root, {
  all: 'unset',
  width: 42,
  height: 25,
  backgroundColor: '$thBorderColor',
  borderRadius: '9999px',
  position: 'relative',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&:focus': { boxShadow: `0 0 0 2px $thBorderColor` },
  '&[data-state="checked"]': { backgroundColor: '#4BB543' },
})

const SwitchThumb = styled(Switch.Thumb, {
  display: 'block',
  width: 21,
  height: 21,
  backgroundColor: '$thTextContrast2',
  borderRadius: '9999px',
  transition: 'transform 100ms',
  transform: 'translateX(2px)',
  willChange: 'transform',
  '&[data-state="checked"]': { transform: 'translateX(19px)' },
})
