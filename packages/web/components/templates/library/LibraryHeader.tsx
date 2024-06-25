import { useEffect, useRef, useState } from 'react'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { theme } from '../../tokens/stitches.config'
import { FormInput } from '../../elements/FormElements'
import { searchBarCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { Button } from '../../elements/Button'
import { FunnelSimple, X } from '@phosphor-icons/react'
import { LayoutType } from '../homeFeed/HomeFeedContainer'
import { OmnivoreSmallLogo } from '../../elements/images/OmnivoreNameLogo'
import { LIBRARY_LEFT_MENU_WIDTH } from '../navMenu/LibraryMenu'
import { BulkAction } from '../../../lib/networking/mutations/bulkActionMutation'
import { HeaderToggleGridIcon } from '../../elements/icons/HeaderToggleGridIcon'
import { HeaderToggleListIcon } from '../../elements/icons/HeaderToggleListIcon'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import {
  MultiSelectControls,
  CheckBoxButton,
} from '../homeFeed/MultiSelectControls'

export type MultiSelectMode = 'off' | 'none' | 'some' | 'visible' | 'search'

export type LibraryHeaderProps = {
  viewer: UserBasicData | undefined

  layout: LayoutType
  updateLayout: (layout: LayoutType) => void

  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void

  showFilterMenu: boolean

  numItemsSelected: number
  multiSelectMode: MultiSelectMode
  setMultiSelectMode: (mode: MultiSelectMode) => void

  performMultiSelectAction: (action: BulkAction, labelIds?: string[]) => void
}

export function LibraryHeader(props: LibraryHeaderProps): JSX.Element {
  const [small, setSmall] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setSmall(window.scrollY > 40)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll)
    }
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <VStack
        alignment="start"
        distribution="start"
        css={{
          width: '100%',
          px: '70px',
          left: LIBRARY_LEFT_MENU_WIDTH,
          transition: 'height 0.5s',
          '@mdDown': {
            left: '0px',
            right: '0',
          },
          '@xlgDown': {
            px: props.showFilterMenu ? '0px' : '60px',
            pr: '10px',
          },
        }}
      >
        <LargeHeaderLayout {...props} />
      </VStack>
    </>
  )
}

function LargeHeaderLayout(props: LibraryHeaderProps): JSX.Element {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        gap: '10px',
        width: '100%',
        height: '100%',
      }}
    >
      {props.multiSelectMode !== 'off' ? (
        <>
          <MultiSelectControls {...props} />
        </>
      ) : (
        <HeaderControls {...props} />
      )}
    </HStack>
  )
}

const HeaderControls = (props: LibraryHeaderProps): JSX.Element => {
  const [searchBoxFocused, setSearchBoxFocused] = useState(false)

  return (
    <>
      <SearchBox
        {...props}
        searchBoxFocused={searchBoxFocused}
        setSearchBoxFocused={setSearchBoxFocused}
      />

      <SpanBox css={{ display: 'flex', ml: 'auto', gap: '10px' }}>
        {/* {userHasFeature(props.viewer, 'ai-summaries') && (
          <Button
            title="TLDR Summaries"
            style="plainIcon"
            css={{
              display: 'flex',
              marginLeft: 'auto',
              '&:hover': { opacity: '1.0' },
            }}
            onClick={(e) => {
              if (props.mode == 'reads') {
                props.setMode('tldr')
              } else {
                props.setMode('reads')
              }
              e.preventDefault()
            }}
          >
            <HeaderToggleTLDRIcon />
          </Button>
        )} */}

        <Button
          title={
            props.layout == 'GRID_LAYOUT'
              ? 'Switch to list layout'
              : 'Switch to grid layout'
          }
          style="plainIcon"
          css={{
            display: 'flex',
            marginLeft: 'auto',
            '&:hover': { opacity: '1.0' },
          }}
          onClick={(e) => {
            props.updateLayout(
              props.layout == 'GRID_LAYOUT' ? 'LIST_LAYOUT' : 'GRID_LAYOUT'
            )
            e.preventDefault()
          }}
        >
          {props.layout == 'LIST_LAYOUT' ? (
            <HeaderToggleGridIcon />
          ) : (
            <HeaderToggleListIcon />
          )}
        </Button>
      </SpanBox>
    </>
  )
}

type MenuHeaderButtonProps = {
  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void
}

export function MenuHeaderButton(props: MenuHeaderButtonProps): JSX.Element {
  return (
    <HStack
      css={{
        width: '67px',
        height: '40px',
        bg: props.showFilterMenu ? '$thTextContrast2' : '$thBackground2',
        borderRadius: '5px',
        px: '5px',
        cursor: 'pointer',
      }}
      alignment="center"
      distribution="around"
      onClick={() => {
        props.setShowFilterMenu(!props.showFilterMenu)
      }}
    >
      <OmnivoreSmallLogo
        size={20}
        strokeColor={
          props.showFilterMenu
            ? theme.colors.thBackground.toString()
            : theme.colors.thTextContrast2.toString()
        }
      />
      <FunnelSimple
        size={20}
        color={
          props.showFilterMenu
            ? theme.colors.thBackground.toString()
            : theme.colors.thTextContrast2.toString()
        }
      />
    </HStack>
  )
}

type SearchBoxProps = LibraryHeaderProps & {
  searchBoxFocused: boolean
  setSearchBoxFocused: (show: boolean) => void
}

export function SearchBox(props: SearchBoxProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [searchTerm, setSearchTerm] = useState(props.searchTerm ?? '')

  useEffect(() => {
    setSearchTerm(props.searchTerm ?? '')
  }, [props.searchTerm])

  useKeyboardShortcuts(
    searchBarCommands((action) => {
      if (action === 'focusSearchBar' && inputRef.current) {
        inputRef.current.select()
      }
      if (action == 'clearSearch' && inputRef.current) {
        setSearchTerm('')
        props.applySearchQuery('')
      }
    })
  )

  return (
    <Box
      css={{
        height: '38px',
        width: '100%',
        maxWidth: '521px',
        bg: '$backgroundMedium',
        borderRadius: '6px',
        boxShadow: props.searchBoxFocused
          ? 'none'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06);',
      }}
    >
      <HStack
        alignment="center"
        distribution="start"
        css={{ width: '100%', height: '100%' }}
      >
        <HStack
          alignment="center"
          distribution="center"
          css={{
            width: '53px',
            height: '100%',
            display: 'flex',
            bg: props.multiSelectMode !== 'off' ? '$ctaBlue' : 'transparent',
            borderTopLeftRadius: '6px',
            borderBottomLeftRadius: '6px',
            '--checkbox-color': 'var(--colors-thLibraryMultiselectCheckbox)',
            '&:hover': {
              bg: '$thLibraryMultiselectHover',
              '--checkbox-color':
                'var(--colors-thLibraryMultiselectCheckboxHover)',
            },
          }}
        >
          <CheckBoxButton {...props} />
        </HStack>
        <HStack
          alignment="center"
          distribution="start"
          css={{
            border: props.searchBoxFocused
              ? '2px solid $searchActiveOutline'
              : '2px solid transparent',
            borderTopRightRadius: '6px',
            borderBottomRightRadius: '6px',
            width: '100%',
            height: '100%',
          }}
        >
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              props.applySearchQuery(searchTerm || '')
              inputRef.current?.blur()
            }}
            style={{ width: '100%' }}
          >
            <FormInput
              ref={inputRef}
              type="text"
              value={searchTerm}
              autoFocus={false}
              placeholder="Search keywords or labels"
              onFocus={(event) => {
                event.target.select()
                props.setSearchBoxFocused(true)
              }}
              onBlur={() => {
                props.setSearchBoxFocused(false)
              }}
              onChange={(event) => {
                setSearchTerm(event.target.value)
              }}
              onKeyDown={(event) => {
                const key = event.key.toLowerCase()
                if (key == 'escape') {
                  event.currentTarget.blur()
                }
              }}
            />
          </form>
          <HStack
            alignment="center"
            css={{
              py: '15px',
              mr: '10px',
              marginLeft: 'auto',
            }}
          >
            <CancelSearchButton
              onClick={() => {
                setSearchTerm('in:inbox')
                props.applySearchQuery('')
                inputRef.current?.blur()
              }}
            />
          </HStack>
        </HStack>
      </HStack>
    </Box>
  )
}

type CancelSearchButtonProps = {
  onClick: () => void
}

const CancelSearchButton = (props: CancelSearchButtonProps): JSX.Element => {
  const [color, setColor] = useState<string>(
    theme.colors.thTextContrast2.toString()
  )
  return (
    <Button
      title="Cancel"
      style="plainIcon"
      css={{
        p: '5px',
        display: 'flex',
        '&:hover': {
          bg: '$ctaBlue',
          borderRadius: '100px',
          opacity: 1.0,
        },
      }}
      onMouseEnter={(event) => {
        setColor('white')
        event.preventDefault()
      }}
      onMouseLeave={(event) => {
        setColor(theme.colors.thTextContrast2.toString())
        event.preventDefault()
      }}
      onClick={(event) => {
        event.preventDefault()
        props.onClick()
      }}
    >
      <X width={19} height={19} color={color} />
    </Button>
  )
}
