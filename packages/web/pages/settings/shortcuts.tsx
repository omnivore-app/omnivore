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
  useResetShortcuts,
} from '../../lib/networking/shortcuts/useShortcuts'
import { ShortcutsTree } from '../../components/templates/ShortcutsTree'
import { TreeApi } from 'react-arborist'

type ListAction = 'RESET' | 'ADD_ITEM' | 'REMOVE_ITEM'

const SHORTCUTS_KEY = 'library-shortcuts'

export default function Shortcuts(): JSX.Element {
  applyStoredTheme()
  const [navMenuStyle, setNavMenuStyle] = usePersistedState<
    'legacy' | 'shortcuts'
  >({
    key: 'library-nav-menu-style',
    initialValue: 'legacy',
  })

  const listReducer = (
    state: { state: string; items: Shortcut[] },
    action: {
      type: ListAction
      item?: Shortcut
    }
  ) => {
    switch (action.type) {
      case 'RESET': {
        const itemStr = window['localStorage'].getItem(SHORTCUTS_KEY)
        if (itemStr) {
          try {
            const parsed = JSON.parse(itemStr)
            if (Array.isArray(parsed)) {
              return { state: 'CURRENT', items: parsed as Shortcut[] }
            }
          } catch (err) {
            console.log('error: ', err)
          }
        }
        return { state: 'CURRENT', items: [] }
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
        return { state: 'CURRENT', items: [...state.items] }
      }
      case 'REMOVE_ITEM': {
        const item = action.item
        if (!item) {
          return state
        }
        const updated = state.items.filter((existing) => existing.id != item.id)
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

  useEffect(() => {
    try {
      if (shortcuts.state == 'CURRENT') {
        window['localStorage'].setItem(
          SHORTCUTS_KEY,
          JSON.stringify(shortcuts.items)
        )
      }
    } catch (error) {
      console.log('error": ', error)
    }
  }, [shortcuts])

  useEffect(() => {
    dispatchList({ type: 'RESET' })
  }, [])

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
          <Box css={{}}>
            <StyledText style="fixedHeadline" css={{ my: '6px' }}>
              Shortcuts
            </StyledText>
            <StyledText css={{}}>
              Use shortcuts to access your most important reads quickly. You can
              create folders for your shortcuts, remove shortcuts, and select
              items from your labels, subscriptions, and saved searches to be
              added to your shortcuts.
            </StyledText>
          </Box>
          <HStack
            css={{
              px: '10px',
              pt: '2px',
              height: '30px',
              gap: '5px',

              fontSize: '14px',
              fontWeight: 'regular',
              fontFamily: '$display',
              color:
                navMenuStyle !== 'shortcuts'
                  ? '$thLibraryMenuSecondary'
                  : '$thLibraryMenuUnselected',

              verticalAlign: 'middle',
              borderRadius: '3px',
              cursor: 'pointer',

              '&:hover': {
                backgroundColor: '$thBackground4',
              },
            }}
            alignment="center"
            distribution="start"
            onClick={(event) => {
              setNavMenuStyle(
                navMenuStyle == 'shortcuts' ? 'legacy' : 'shortcuts'
              )
              event.preventDefault()
            }}
          ></HStack>
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
            <SelectedItems
              shortcuts={shortcuts.items}
              dispatchList={dispatchList}
            />
            <AvailableItems
              shortcuts={shortcuts.items}
              dispatchList={dispatchList}
            />
          </Box>
        </VStack>
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
  shortcuts: Shortcut[]
  dispatchList: (arg: { type: ListAction; item?: Shortcut | undefined }) => void
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
      return !!props.shortcuts.find((shortcut) => shortcut.id == search.id)
    },
    [props]
  )

  const labelSelected = useCallback(
    (label: Label) => {
      return !!props.shortcuts.find((shortcut) => shortcut.id == label.id)
    },
    [props]
  )

  const subscriptionSelected = useCallback(
    (subscription: Subscription) => {
      return !!props.shortcuts.find(
        (shortcut) => shortcut.id == subscription.id
      )
    },
    [props]
  )

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
      <StyledText style="settingsSection">Available items</StyledText>
      <VStack
        css={{
          width: '420px',
          py: '30px',
          pl: '28px', // becomes labels have some margin built in
          pr: '30px',
          gap: '10px',
          bg: '$thLeftMenuBackground',
        }}
      >
        <StyledText style="settingsSection">Saved Searches</StyledText>
        {sortedsavedSearches?.map((search) => {
          return (
            <Button
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
              key={`search-${search.id}`}
              onClick={(event) => {
                const item: Shortcut = {
                  id: search.id,
                  name: search.name,
                  type: 'label',
                  section: 'library',
                  filter: search.filter,
                }
                props.dispatchList({
                  item,
                  type: searchSelected(search) ? 'REMOVE_ITEM' : 'ADD_ITEM',
                })

                event.preventDefault()
              }}
            >
              {' '}
              <StyledText style="settingsItem">{search.name}</StyledText>
              <SpanBox css={{ ml: 'auto' }}>
                {searchSelected(search) ? (
                  <CheckSquare size={20} weight="duotone" />
                ) : (
                  <Square size={20} weight="duotone" />
                )}
              </SpanBox>
            </Button>
          )
        })}
        <SectionSeparator />

        <StyledText style="settingsSection">Labels</StyledText>
        {sortedLabels.map((label) => {
          return (
            <Button
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
              key={`label-${label.id}`}
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
          return (
            <Button
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
              key={`subscription-${subscription.id}`}
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
        })}
      </VStack>
    </VStack>
  )
}

type AvailableItemButtonProps = {
  shortcut: Shortcut
  isSelected: boolean
  listAction: (arg: { type: ListAction; item?: Shortcut | undefined }) => void
}

const AvailableItemButton = (props: AvailableItemButtonProps): JSX.Element => {
  const shortcutId = `checkbox-search-${props.shortcut.id}`
  return (
    <CheckboxButton
      itemKey={shortcutId}
      title={props.shortcut.filter}
      isSelected={props.isSelected}
      item={props.shortcut}
      listAction={props.listAction}
    >
      <SpanBox css={{}}>{props.shortcut.name}</SpanBox>
    </CheckboxButton>
  )
}

const SelectedItems = (props: ListProps): JSX.Element => {
  const treeRef = useRef<TreeApi<Shortcut> | undefined>(undefined)
  const resetShortcuts = useResetShortcuts()

  const createNewFolder = useCallback(async () => {
    if (treeRef.current) {
      const result = await treeRef.current.create({
        type: 'internal',
        index: 0,
      })
    }
  }, [treeRef])

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
      <StyledText style="settingsSection">Your shortcuts</StyledText>
      <Box
        css={{
          width: '100%',
          height: '100%',
          pt: '10px',
          bg: '$thLeftMenuBackground',

          '[role="treeitem"]': {
            outline: 'none',
          },
          '[role="treeitem"]:focus': {
            outline: 'none',
          },
        }}
      >
        <ShortcutsTree treeRef={treeRef} />
      </Box>
    </VStack>
  )
}

type CheckboxButtonProps = {
  itemKey: string
  title: string
  isSelected: boolean
  item: Shortcut

  listAction: (arg: { type: ListAction; item?: Shortcut | undefined }) => void
  children: ReactNode
}

function CheckboxButton(props: CheckboxButtonProps): JSX.Element {
  const handleChange = useCallback(
    (selected: boolean) => {
      if (!selected) {
        props.listAction({
          type: 'REMOVE_ITEM',
          item: props.item,
        })
      } else {
        props.listAction({
          type: 'ADD_ITEM',
          item: props.item,
        })
      }
    },
    [props]
  )
  return (
    <HStack
      key={props.itemKey}
      title={props.title}
      css={{
        px: '10px',
        pt: '2px',
        height: '30px',
        gap: '5px',

        fontSize: '14px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: props.isSelected
          ? '$thLibraryMenuSecondary'
          : '$thLibraryMenuUnselected',

        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',

        m: '0px',
        '&:hover': {
          backgroundColor: '$thBackground4',
        },
      }}
      alignment="center"
      distribution="start"
      onClick={(event) => {
        handleChange(!props.isSelected)
        event.preventDefault()
      }}
    >
      {props.isSelected ? (
        <CheckSquare size={20} weight="duotone" />
      ) : (
        <Square size={20} weight="duotone" />
      )}
      {props.children}
    </HStack>
  )
}
