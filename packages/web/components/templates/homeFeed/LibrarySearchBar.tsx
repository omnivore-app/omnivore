import { ReactNode, useEffect, useRef, useState } from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, VStack } from '../../elements/LayoutPrimitives'
import { SearchIcon } from '../../elements/images/SearchIcon'
import { theme } from '../../tokens/stitches.config'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { FormInput } from '../../elements/FormElements'
import { searchBarCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { DateTime } from 'luxon'

type LibrarySearchBarProps = {
  searchTerm?: string
  applySearchQuery: (searchQuery: string) => void
}

type LibraryFilter =
  | 'in:inbox'
  | 'in:all'
  | 'in:archive'
  | 'type:file'
  | 'type:highlights'
  | `saved:${string}`

const recentlySavedStartDate = DateTime.now().minus({ days: 7 }).toISODate()

const FOCUSED_BOXSHADOW = '0px 0px 2px 2px rgba(255, 234, 159, 0.56)'

export function LibrarySearchBar(props: LibrarySearchBarProps): JSX.Element {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState(props.searchTerm || '')

  useEffect(() => {
    setSearchTerm(props.searchTerm || '')
  }, [props.searchTerm])

  useKeyboardShortcuts(
    searchBarCommands((action) => {
      if (action === 'focusSearchBar' && inputRef.current) {
        inputRef.current.select()
      }
    })
  )

  return (
    <VStack css={{ width: '100%' }}>
      <HStack
        alignment="center"
        distribution="start"
        css={{
          bg: '$grayBg',
          width: '100%',
          borderRadius: '8px',
          flex: 1,
          border: '1px solid $grayBorder',
          maxHeight: '40px',
          boxShadow: focused ? FOCUSED_BOXSHADOW : 'unset',
        }}
      >
        <DropdownFilterMenu
          triggerElement={
            <HStack
              alignment="center"
              distribution="between"
              css={{
                width: '5em',
                height: '100%',
                bg: '$grayBgActive',
                px: '$3',
                borderRadius: '8px 0px 0px 8px',
                '&:hover:': { bg: '$grayBgHover' },
              }}
            >
              <StyledText style="controlButton" css={{ m: '8px', ml: '0px' }}>
                Filters
              </StyledText>
              <Box
                css={{ width: '8px', color: '$grayText' }}
                className="dropdown-arrow"
              />
            </HStack>
          }
          onFilterChange={(filter: LibraryFilter) => {
            props.applySearchQuery(filter)
          }}
        />
        <Box css={{ mx: '$2', pt: '$1' }}>
          <span>
            <SearchIcon strokeColor={theme.colors.graySolid.toString()} />
          </span>
        </Box>
        <Box css={{ width: '100%' }}>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              props.applySearchQuery(searchTerm || '')
              inputRef.current?.blur()
            }}
          >
            <FormInput
              ref={inputRef}
              type="text"
              value={searchTerm}
              placeholder="Search"
              onFocus={(event) => {
                event.target.select()
                setFocused(true)
              }}
              onBlur={() => {
                setFocused(false)
              }}
              onChange={(event) => {
                setSearchTerm(event.target.value)
              }}
            />
          </form>
        </Box>
      </HStack>
      {/* <Button>Clear current search</Button> */}
    </VStack>
  )
}

type DropdownFilterMenuProps = {
  triggerElement: ReactNode
  onFilterChange: (filter: LibraryFilter) => void
}

export function DropdownFilterMenu(
  props: DropdownFilterMenuProps
): JSX.Element {
  return (
    <Dropdown triggerElement={props.triggerElement}>
      <DropdownOption
        onSelect={() => props.onFilterChange('in:inbox')}
        title="Inbox"
      />
      <DropdownOption
        onSelect={() => props.onFilterChange('in:all')}
        title="All"
      />
      <DropdownOption
        onSelect={() => props.onFilterChange('in:archive')}
        title="Archived"
        hideSeparator
      />
      <DropdownOption
        onSelect={() => props.onFilterChange('type:file')}
        title="Files"
        hideSeparator
      />
      <DropdownOption
        onSelect={() => props.onFilterChange('type:highlights')}
        title="Highlights"
        hideSeparator
      />
      <DropdownOption
        onSelect={() => props.onFilterChange(`saved:${recentlySavedStartDate}`)}
        title="Recently Saved"
        hideSeparator
      />
    </Dropdown>
  )
}
