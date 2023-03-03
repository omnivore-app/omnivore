import { useRef, useState } from 'react'
import { Box, HStack, VStack } from '../../elements/LayoutPrimitives'
import { theme } from '../../tokens/stitches.config'
import { FormInput } from '../../elements/FormElements'
import { searchBarCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { Button, IconButton } from '../../elements/Button'
import { FunnelSimple, MagnifyingGlass, X } from 'phosphor-react'
import { ListSelectorIcon } from '../../elements/images/ListSelectorIcon'
import { GridSelectorIcon } from '../../elements/images/GridSelectorIcon'
import { LayoutType } from './HomeFeedContainer'
import { PrimaryDropdown } from '../PrimaryDropdown'
import { LogoBox } from '../../elements/LogoBox'
import { OmnivoreSmallLogo } from '../../elements/images/OmnivoreNameLogo'

type LibraryHeaderProps = {
  layout: LayoutType
  updateLayout: (layout: LayoutType) => void

  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void

  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void
}

const HEADER_HEIGHT = '105px'
export const LIBRARY_HEADER_MOBILE_HEIGHT = '70px'

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
          bg: '$thBackground',
          pt: '35px',
          borderBottom: '1px solid $thBorderColor',
          '@mdDown': {
            height: LIBRARY_HEADER_MOBILE_HEIGHT,
            pt: '0px',
          },
        }}
      >
        {/* These will display/hide depending on breakpoints */}
        <LargeHeaderLayout {...props} />
        <SmallHeaderLayout {...props} />
      </VStack>

      {/* This spacer is put in to push library content down 
      below the fixed header height. */}
      <Box
        css={{
          height: HEADER_HEIGHT,
          bg: '$grayBase',
          '@mdDown': {
            height: LIBRARY_HEADER_MOBILE_HEIGHT,
          },
        }}
      ></Box>
    </>
  )
}

function LargeHeaderLayout(props: LibraryHeaderProps): JSX.Element {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        width: '100%',
        height: '100%',
        '@mdDown': {
          display: 'none',
        },
      }}
    >
      <LogoBox />
      <SearchBox {...props} />
      <ControlButtonBox
        layout={props.layout}
        updateLayout={props.updateLayout}
      />
    </HStack>
  )
}

function SmallHeaderLayout(props: LibraryHeaderProps): JSX.Element {
  const [showInlineSearch, setShowInlineSearch] = useState(false)

  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        width: '100%',
        height: '100%',
        bg: '$thBackground3',
        '@md': {
          display: 'none',
        },
      }}
    >
      {showInlineSearch ? (
        <HStack css={{ pl: '10px', pr: '0px', width: '100%' }}>
          <SearchBox {...props} compact={true} />
          <Button
            style="cancelGeneric"
            onClick={(event) => {
              setShowInlineSearch(false)
              event.preventDefault()
            }}
          >
            Close
          </Button>
        </HStack>
      ) : (
        <>
          <MenuHeaderButton {...props} />
          <ControlButtonBox
            layout={props.layout}
            updateLayout={props.updateLayout}
            setShowInlineSearch={setShowInlineSearch}
          />
        </>
      )}
    </HStack>
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
        ml: '10px',
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

export type SearchBoxProps = {
  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void

  compact?: boolean
  onClose?: () => void
}

export function SearchBox(props: SearchBoxProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState(false)
  const [searchTerm, setSearchTerm] = useState(props.searchTerm ?? '')

  const border = props.compact
    ? focused
      ? '1px solid $omnivoreCtaYellow'
      : '1px solid black'
    : focused
    ? '1px solid $omnivoreCtaYellow'
    : '1px solid $thBorderColor'

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
        bg: props.compact ? 'white' : '$thBackground2',
        borderRadius: '6px',
        border: border,
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
          css={{
            height: '100%',
            pl: props.compact ? '10px' : '15px',
            pr: props.compact ? '5px' : '10px',
          }}
          onClick={(e) => {
            inputRef.current?.focus()
            e.preventDefault()
          }}
        >
          <MagnifyingGlass
            size={props.compact ? 15 : 20}
            color={theme.colors.graySolid.toString()}
          />
        </HStack>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            props.applySearchQuery(searchTerm || '')
            inputRef.current?.blur()
            if (props.onClose) {
              props.onClose()
            }
          }}
          style={{ width: '100%' }}
        >
          <FormInput
            ref={inputRef}
            type="text"
            value={searchTerm}
            autoFocus={!!props.compact}
            placeholder="Search keywords or labels"
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
        {searchTerm && searchTerm.length ? (
          <Box
            css={{
              py: '15px',
              marginLeft: 'auto',
            }}
          >
            <IconButton
              css={{
                p: '0px',
                mr: '5px',
                width: '28px',
                height: '28px',
                color: '#898989',
              }}
              onClick={(event) => {
                event.preventDefault()
                setSearchTerm('')
                props.applySearchQuery('')
                inputRef.current?.blur()
              }}
              tabIndex={-1}
            >
              <X
                width={16}
                height={16}
                color={theme.colors.grayTextContrast.toString()}
              />
            </IconButton>
          </Box>
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

type ControlButtonBoxProps = {
  layout: LayoutType
  updateLayout: (layout: LayoutType) => void
  setShowInlineSearch?: (show: boolean) => void
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
        <PrimaryDropdown showThemeSection={true} />
      </HStack>

      {props.setShowInlineSearch && (
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
          <Button
            style="ghost"
            onClick={() => {
              props.setShowInlineSearch && props.setShowInlineSearch(true)
            }}
            css={{
              display: 'flex',
            }}
          >
            <MagnifyingGlass
              size={20}
              color={theme.colors.graySolid.toString()}
            />
          </Button>
          <PrimaryDropdown
            showThemeSection={true}
            layout={props.layout}
            updateLayout={props.updateLayout}
          />
        </HStack>
      )}
    </>
  )
}
