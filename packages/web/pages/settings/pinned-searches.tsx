import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { Toaster } from 'react-hot-toast'
import { Button } from '../../components/elements/Button'
import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { StyledText } from '../../components/elements/StyledText'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { styled, theme } from '../../components/tokens/stitches.config'
import { updateEmailMutation } from '../../lib/networking/mutations/updateEmailMutation'
import { updateUserMutation } from '../../lib/networking/mutations/updateUserMutation'
import { updateUserProfileMutation } from '../../lib/networking/mutations/updateUserProfileMutation'
import { useGetLibraryItemsQuery } from '../../lib/networking/queries/useGetLibraryItemsQuery'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { useValidateUsernameQuery } from '../../lib/networking/queries/useValidateUsernameQuery'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { ProgressBar } from '../../components/elements/ProgressBar'
import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import { useGetSavedSearchQuery } from '../../lib/networking/queries/useGetSavedSearchQuery'
import CheckboxComponent from '../../components/elements/Checkbox'
import { Label } from '../../lib/networking/fragments/labelFragment'
import { Circle, ToggleLeft } from 'phosphor-react'
import { SavedSearch } from '../../lib/networking/fragments/savedSearchFragment'
import { usePersistedState } from '../../lib/hooks/usePersistedState'
import { StyledToggleButton } from '../../components/templates/PrimaryDropdown'

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

  applyStoredTheme(false)

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      <form>
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
              <HStack alignment="center" css={{ gap: '5px', mb: '10px' }}>
                <input
                  type="checkbox"
                  id="switch"
                  checked={!hidePinnedSearches}
                  onChange={(event) => {
                    setHidePinnedSearches(!event.currentTarget.checked)
                  }}
                  style={{ padding: '0px', margin: '0px' }}
                />
                Enable Pinned Searches
              </HStack>

              {!hidePinnedSearches && (
                <>
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
                </>
              )}
            </VStack>
          </VStack>
        </VStack>
      </form>
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

  const changeState = useCallback(
    (newState: boolean) => {
      if (!newState) {
        props.listAction({
          type: 'REMOVE_ITEM',
          item: {
            type: 'label',
            itemId: props.label.id,
            name: props.label.name,
            search: `label:\"${props.label.name}\"`,
          },
        })
      } else {
        props.listAction({
          type: 'ADD_ITEM',
          item: {
            type: 'label',
            itemId: props.label.id,
            name: props.label.name,
            search: `label:\"${props.label.name}\"`,
          },
        })
      }
    },
    [props]
  )

  return (
    <HStack
      key={labelId}
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
      title={props.label.name}
      alignment="center"
      distribution="start"
      onClick={(event) => {
        changeState(!props.isSelected)
        event.preventDefault()
      }}
    >
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={(event) => {
          changeState(event.currentTarget.checked)
          event.preventDefault()
        }}
      />
      <SpanBox css={{}}>{props.label.name}</SpanBox>
      <Circle size={9} color={props.label.color} weight="fill" />
    </HStack>
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
  const searchId = `checkbox-search-${props.search.id}`
  return (
    <HStack
      key={searchId}
      title={props.search.filter}
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
        if (props.isSelected) {
          props.listAction({
            type: 'REMOVE_ITEM',
            item: {
              type: 'saved-search',
              itemId: props.search.id,
              name: props.search.name,
              search: props.search.filter,
            },
          })
        } else {
          props.listAction({
            type: 'ADD_ITEM',
            item: {
              type: 'saved-search',
              itemId: props.search.id,
              name: props.search.name,
              search: props.search.filter,
            },
          })
        }
        event.preventDefault()
      }}
    >
      <input type="checkbox" checked={props.isSelected} onChange={(e) => {}} />
      <SpanBox css={{}}>{props.search.name}</SpanBox>
    </HStack>
  )
}
