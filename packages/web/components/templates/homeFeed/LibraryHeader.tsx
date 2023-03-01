import { useRef, useState } from 'react'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { theme } from '../../tokens/stitches.config'
import { FormInput } from '../../elements/FormElements'
import { searchBarCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { Button, IconButton } from '../../elements/Button'
import { MagnifyingGlass, X } from 'phosphor-react'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'
import { OmnivoreFullLogo } from '../../elements/images/OmnivoreFullLogo'
import { ListSelectorIcon } from '../../elements/images/ListSelectorIcon'
import { GridSelectorIcon } from '../../elements/images/GridSelectorIcon'
import { LayoutType } from './HomeFeedContainer'
import { PrimaryDropdown } from '../PrimaryDropdown'
import { LIBRARY_LEFT_MENU_WIDTH } from './LibraryFilterMenu'

type LibraryHeaderProps = {
  layout: LayoutType
  updateLayout: (layout: LayoutType) => void

  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void
}

const FOCUSED_BOXSHADOW = '0px 0px 2px 2px rgba(255, 234, 159, 0.56)'

const HEADER_HEIGHT = '105px'
const MOBILE_HEIGHT = '48px'

export function LibraryHeader(props: LibraryHeaderProps): JSX.Element {
  return (
    <>
      <VStack
        alignment="center"
        distribution="start"
        css={{
          top: '0',
          left: '0',
          zIndex: 5,
          position: 'fixed',
          width: '100%',
          height: HEADER_HEIGHT,
          bg: 'white',
          pt: '35px',
          borderBottom: '1px solid #E1E1E1',
          '@mdDown': {
            height: MOBILE_HEIGHT,
            pt: '0px',
          },
        }}
      >
        <HStack
          alignment="center"
          distribution="start"
          css={{
            width: '100%',
            height: '100%',
          }}
        >
          <LogoBox />
          <SearchBox {...props} />
          <ControlButtonBox
            layout={props.layout}
            updateLayout={props.updateLayout}
          />
        </HStack>
      </VStack>
      {/* This spacer is put in to push library content down 
      below the fixed header height. */}
      <Box
        css={{
          height: HEADER_HEIGHT,
          bg: '$grayBase',
          '@mdDown': {
            height: MOBILE_HEIGHT,
          },
        }}
      ></Box>
    </>
  )
}

type SearchBoxProps = {
  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void
}

function SearchBox(props: SearchBoxProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState(false)
  const [searchTerm, setSearchTerm] = useState(props.searchTerm ?? '')

  useKeyboardShortcuts(
    searchBarCommands((action) => {
      if (action === 'focusSearchBar' && inputRef.current) {
        inputRef.current.select()
      }
    })
  )

  return (
    <Box
      css={{
        height: '38px',
        width: '100%',
        maxWidth: '521px',
        mr: '15px',
        bg: '#F3F3F3',
        borderRadius: '6px',
        '@mdDown': {
          display: 'none',
        },
        boxShadow: focused ? FOCUSED_BOXSHADOW : 'unset',
      }}
    >
      <HStack
        alignment="center"
        distribution="start"
        css={{ width: '100%', height: '100%' }}
      >
        <HStack
          alignment="center"
          distribution="start"
          css={{ height: '100%', px: '15px' }}
          onClick={(e) => {
            inputRef.current?.focus()
            e.preventDefault()
          }}
        >
          <MagnifyingGlass
            size={20}
            color={theme.colors.graySolid.toString()}
          />
        </HStack>
        <form
          onSubmit={(event) => {
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
        {searchTerm && searchTerm.length > 0 ? (
          <Button
            style="plainIcon"
            onClick={(event) => {
              event.preventDefault()
              setSearchTerm('')
              props.applySearchQuery('')
              inputRef.current?.blur()
            }}
            css={{
              display: 'flex',
              flexDirection: 'row',
              mr: '8px',
              height: '100%',
              alignItems: 'center',
            }}
          >
            <X
              width={16}
              height={16}
              color={theme.colors.grayTextContrast.toString()}
            />
          </Button>
        ) : (
          <Box
            css={{
              py: '15px',
              marginLeft: 'auto',
            }}
          >
            <IconButton
              css={{
                mr: '5px',
                width: '28px',
                height: '28px',
                color: '#898989',
              }}
              onClick={() =>
                requestAnimationFrame(() => inputRef?.current?.focus())
              }
              // we can make it unreachable via keyboard as we have the same message for the SR label
              tabIndex={-1}
            >
              <kbd aria-hidden>/</kbd>
            </IconButton>
          </Box>
        )}
      </HStack>
    </Box>
  )
}

// Displays the full logo on larger screens, small logo on mobile
function LogoBox(): JSX.Element {
  return (
    <>
      <SpanBox
        css={{
          pl: '25px',
          height: '24px',
          width: LIBRARY_LEFT_MENU_WIDTH,
          minWidth: LIBRARY_LEFT_MENU_WIDTH,
          '@mdDown': {
            display: 'none',
          },
        }}
      >
        <OmnivoreFullLogo showTitle={true} />
      </SpanBox>
      <SpanBox
        css={{
          ml: '20px',
          mr: '20px',
          '@md': {
            display: 'none',
          },
        }}
      >
        <OmnivoreNameLogo />
      </SpanBox>
    </>
  )
}

type ControlButtonBoxProps = {
  layout: LayoutType
  updateLayout: (layout: LayoutType) => void
}

function ControlButtonBox(props: ControlButtonBoxProps): JSX.Element {
  return (
    <>
      <HStack
        alignment="center"
        distribution="end"
        css={{
          marginLeft: 'auto',
          marginRight: '45px',
          width: '100px',
          height: '100%',
          gap: '20px',
          minWidth: '121px',
          '@mdDown': {
            display: 'none',
          },
        }}
      >
        <Button
          style="plainIcon"
          css={{ display: 'flex' }}
          onClick={(e) => {
            props.updateLayout('LIST_LAYOUT')
            e.preventDefault()
          }}
        >
          <ListSelectorIcon
            color={props.layout == 'GRID_LAYOUT' ? '#6A6968' : '#FFEA9F'}
          />
        </Button>

        <Button
          style="plainIcon"
          css={{ display: 'flex' }}
          onClick={(e) => {
            props.updateLayout('GRID_LAYOUT')
            e.preventDefault()
          }}
        >
          <GridSelectorIcon
            color={props.layout == 'LIST_LAYOUT' ? '#6A6968' : '#FFEA9F'}
          />
        </Button>
        <PrimaryDropdown />
      </HStack>

      <HStack
        alignment="center"
        distribution="end"
        css={{
          marginLeft: 'auto',
          marginRight: '20px',
          width: '100px',
          height: '100%',
          gap: '20px',
          '@md': {
            display: 'none',
          },
        }}
      >
        <PrimaryDropdown />
      </HStack>
    </>
  )
}
