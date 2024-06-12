import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import { Toaster } from 'react-hot-toast'
import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { StyledText } from '../../components/elements/StyledText'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import { useGetSavedSearchQuery } from '../../lib/networking/queries/useGetSavedSearchQuery'
import { Label } from '../../lib/networking/fragments/labelFragment'
import { CheckSquare, Circle, Square } from '@phosphor-icons/react'
import { SavedSearch } from '../../lib/networking/fragments/savedSearchFragment'
import { usePersistedState } from '../../lib/hooks/usePersistedState'
import { escapeQuotes } from '../../utils/helper'

export type PinnedSearch = {
  type: 'saved-search' | 'label'
  itemId: string
  name: string
  search: string
}

const PINNED_SEARCHES_KEY = `--library-pinned-searches`
type ListAction = 'RESET' | 'ADD_ITEM' | 'REMOVE_ITEM'

export default function PinnedSearches(): JSX.Element {
  const { labels } = useGetLabelsQuery()
  const { savedSearches } = useGetSavedSearchQuery()
  const [hidePinnedSearches, setHidePinnedSearches] = usePersistedState({
    key: '--library-hide-pinned-searches',
    initialValue: false,
    isSessionStorage: false,
  })

  const listReducer = (
    state: { state: string; items: PinnedSearch[] },
    action: {
      type: ListAction
      item?: PinnedSearch
    }
  ) => {
    switch (action.type) {
      case 'RESET': {
        const itemStr = window['localStorage'].getItem(PINNED_SEARCHES_KEY)
        if (itemStr) {
          try {
            const parsed = JSON.parse(itemStr)
            if (Array.isArray(parsed)) {
              return { state: 'CURRENT', items: parsed as PinnedSearch[] }
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
          (existing) =>
            existing.type == item.type && existing.itemId == item.itemId
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
        const updated = state.items.filter(
          (existing) => existing.itemId != item.itemId
        )
        return { state: 'CURRENT', items: [...updated] }
      }
      default:
        throw new Error('unknown action')
    }
  }

  const [pinnedSearches, dispatchList] = useReducer(listReducer, {
    state: 'INITIAL',
    items: [],
  })

  const items = useMemo(() => {
    if (pinnedSearches.state == 'INITIAL') {
      return { labelItems: [], savedSearchItems: [] }
    }
    const labelItems = labels.map((label) => {
      return {
        label,
        isSelected: !!pinnedSearches.items.find(
          (ps) => ps.type == 'label' && ps.itemId == label.id
        ),
      }
    })
    const savedSearchItems = (savedSearches ?? []).map((savedSearch) => {
      return {
        savedSearch,
        isSelected: !!pinnedSearches.items.find(
          (ps) => ps.type == 'saved-search' && ps.itemId == savedSearch.id
        ),
      }
    })
    return { labelItems, savedSearchItems }
  }, [pinnedSearches, labels, savedSearches])

  useEffect(() => {
    try {
      // Only write updated state to local storage
      if (pinnedSearches.state == 'CURRENT') {
        window['localStorage'].setItem(
          PINNED_SEARCHES_KEY,
          JSON.stringify(pinnedSearches.items)
        )
      }
    } catch (error) {
      console.log('error": ', error)
    }
  }, [pinnedSearches])

  useEffect(() => {
    dispatchList({ type: 'RESET' })
  }, [])

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
            maxWidth: '865px',
          }}
        >
          <Box>
            <StyledText style="fixedHeadline" css={{ my: '6px' }}>
              Pinned Searches
            </StyledText>
            <StyledText style="caption" css={{}}>
              Pin up to five searches from your labels or saved searches.
            </StyledText>
          </Box>

          <VStack
            css={{
              padding: '24px',
              width: '100%',
              height: '100%',
              bg: '$grayBg',
              gap: '5px',
              borderRadius: '5px',
            }}
            distribution="start"
            alignment="start"
          >
            <HStack
              css={{
                px: '10px',
                pt: '2px',
                mb: '20px',
                height: '30px',
                gap: '5px',

                fontSize: '14px',
                fontWeight: 'regular',
                fontFamily: '$display',
                color: !hidePinnedSearches
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
                setHidePinnedSearches(!hidePinnedSearches)
                event.preventDefault()
              }}
            >
              {!hidePinnedSearches ? (
                <CheckSquare size={20} weight="duotone" />
              ) : (
                <Square size={20} weight="duotone" />
              )}
              <StyledText style="modalTitle" css={{}}>
                Enable Pinned Searches
              </StyledText>
            </HStack>

            {!hidePinnedSearches && (
              <Box css={{ pl: '10px' }}>
                <StyledText style="modalTitle" css={{}}>
                  Saved Searches
                </StyledText>
                {items.savedSearchItems.map((item) => {
                  return (
                    <SearchButton
                      key={`search-${item.savedSearch.id}`}
                      search={item.savedSearch}
                      isSelected={item.isSelected}
                      listAction={dispatchList}
                    />
                  )
                })}

                <StyledText style="modalTitle" css={{ mt: '20px' }}>
                  Labels
                </StyledText>
                {items.labelItems.map((item) => {
                  return (
                    <LabelButton
                      label={item.label}
                      key={`label-${item.label.id}`}
                      listAction={dispatchList}
                      isSelected={item.isSelected}
                    />
                  )
                })}
              </Box>
            )}
          </VStack>
        </VStack>
      </VStack>
    </SettingsLayout>
  )
}

type LabelButtonProps = {
  label: Label
  isSelected: boolean
  listAction: (arg: {
    type: ListAction
    item?: PinnedSearch | undefined
  }) => void
}

function LabelButton(props: LabelButtonProps): JSX.Element {
  const labelId = `checkbox-label-${props.label.id}`
  return (
    <CheckboxButton
      itemKey={labelId}
      title={props.label.name}
      isSelected={props.isSelected}
      item={{
        type: 'label',
        itemId: props.label.id,
        name: props.label.name,
        search: `label:\"${escapeQuotes(props.label.name)}\"`,
      }}
      listAction={props.listAction}
    >
      <SpanBox css={{}}>{props.label.name}</SpanBox>
      <Circle size={9} color={props.label.color} weight="fill" />
    </CheckboxButton>
  )
}

type SearchButtonProps = {
  search: SavedSearch
  isSelected: boolean
  listAction: (arg: {
    type: ListAction
    item?: PinnedSearch | undefined
  }) => void
}

function SearchButton(props: SearchButtonProps): JSX.Element {
  console.log(' ', props.search.name, props.isSelected)
  const searchId = `checkbox-search-${props.search.id}`
  return (
    <CheckboxButton
      itemKey={searchId}
      title={props.search.filter}
      isSelected={props.isSelected}
      item={{
        type: 'saved-search',
        itemId: props.search.id,
        name: props.search.name,
        search: props.search.filter,
      }}
      listAction={props.listAction}
    >
      <SpanBox css={{}}>{props.search.name}</SpanBox>
    </CheckboxButton>
  )
}

type CheckboxButtonProps = {
  itemKey: string
  title: string
  isSelected: boolean
  item: PinnedSearch

  listAction: (arg: {
    type: ListAction
    item?: PinnedSearch | undefined
  }) => void
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
