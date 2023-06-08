import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { theme } from '../../tokens/stitches.config'
import { FormInput } from '../../elements/FormElements'
import { searchBarCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { Button, IconButton } from '../../elements/Button'
import {
  ArchiveBox,
  CaretDown,
  FunnelSimple,
  ListBullets,
  MagnifyingGlass,
  Prohibit,
  SquaresFour,
  TagSimple,
  TrashSimple,
  X,
} from 'phosphor-react'
import { LayoutType } from './HomeFeedContainer'
import { PrimaryDropdown } from '../PrimaryDropdown'
import { OmnivoreSmallLogo } from '../../elements/images/OmnivoreNameLogo'
import { HeaderSpacer, HEADER_HEIGHT } from './HeaderSpacer'
import { LIBRARY_LEFT_MENU_WIDTH } from '../../templates/homeFeed/LibraryFilterMenu'
import {
  ScrollOffsetChangeset,
  useScrollWatcher,
} from '../../../lib/hooks/useScrollWatcher'
import { CardCheckbox } from '../../patterns/LibraryCards/LibraryCardStyles'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'

export type MultiSelectMode = 'off' | 'none' | 'some' | 'visible' | 'search'

type LibraryHeaderProps = {
  layout: LayoutType
  updateLayout: (layout: LayoutType) => void

  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void

  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void

  showAddLinkModal: () => void

  numItemsSelected: number
  multiSelectMode: MultiSelectMode
  setMultiSelectMode: (mode: MultiSelectMode) => void
}

export function LibraryHeader(props: LibraryHeaderProps): JSX.Element {
  const [showBackground, setShowBackground] = useState(false)

  useEffect(() => {
    setShowBackground(window.scrollY > 5 || props.multiSelectMode !== 'off')
  }, [props.multiSelectMode])

  useScrollWatcher((changeset: ScrollOffsetChangeset) => {
    setShowBackground(window.scrollY > 5 || props.multiSelectMode !== 'off')
  }, 0)

  return (
    <>
      <VStack
        alignment="center"
        distribution="start"
        css={{
          top: '0',
          right: '0',
          left: LIBRARY_LEFT_MENU_WIDTH,
          zIndex: 5,
          position: 'fixed',
          height: HEADER_HEIGHT,
          bg: showBackground ? '$thBackground' : 'transparent',
          '@mdDown': {
            left: '0px',
            right: '0',
          },
        }}
      >
        {/* These will display/hide depending on breakpoints */}
        <LargeHeaderLayout {...props} />
        <SmallHeaderLayout {...props} />
      </VStack>

      {/* This spacer is put in to push library content down 
      below the fixed header height. */}
      <HeaderSpacer />
    </>
  )
}

function LargeHeaderLayout(props: LibraryHeaderProps): JSX.Element {
  return (
    <HStack
      alignment="center"
      distribution="center"
      css={{
        width: '100%',
        height: '100%',
        '@mdDown': {
          display: 'none',
        },
      }}
    >
      <ControlButtonBox
        layout={props.layout}
        updateLayout={props.updateLayout}
        numItemsSelected={props.numItemsSelected}
        multiSelectMode={props.multiSelectMode}
        setMultiSelectMode={props.setMultiSelectMode}
        showAddLinkModal={props.showAddLinkModal}
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
            numItemsSelected={props.numItemsSelected}
            multiSelectMode={props.multiSelectMode}
            setMultiSelectMode={props.setMultiSelectMode}
            showAddLinkModal={props.showAddLinkModal}
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
            onKeyDown={(event) => {
              const key = event.key.toLowerCase()
              if (key == 'escape') {
                event.currentTarget.blur()
              }
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
              style="searchButton"
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
              style="searchButton"
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

  showAddLinkModal: () => void

  numItemsSelected: number
  multiSelectMode: MultiSelectMode
  setMultiSelectMode: (mode: MultiSelectMode) => void
}

function MultiSelectControlButtonBox(
  props: ControlButtonBoxProps
): JSX.Element {
  const [isChecked, setIsChecked] = useState(false)

  const handleCheckChanged = useCallback(() => {
    setIsChecked(!isChecked)
  }, [isChecked])

  return (
    <HStack alignment="center" distribution="center" css={{ gap: '20px' }}>
      <Button
        style="outline"
        // onClick={(e) => {
        //   props.updateLayout(
        //     props.layout == 'GRID_LAYOUT' ? 'LIST_LAYOUT' : 'GRID_LAYOUT'
        //   )
        //   e.preventDefault()
        // }}
      >
        <ArchiveBox
          width={20}
          height={20}
          color={theme.colors.thTextContrast2.toString()}
        />
        Archive
      </Button>
      <Button
        style="outline"
        // onClick={(e) => {
        //   props.updateLayout(
        //     props.layout == 'GRID_LAYOUT' ? 'LIST_LAYOUT' : 'GRID_LAYOUT'
        //   )
        //   e.preventDefault()
        // }}
      >
        <TagSimple
          width={20}
          height={20}
          color={theme.colors.thTextContrast2.toString()}
        />
        Label
      </Button>
      <Button
        style="outline"
        // onClick={(e) => {
        //   props.updateLayout(
        //     props.layout == 'GRID_LAYOUT' ? 'LIST_LAYOUT' : 'GRID_LAYOUT'
        //   )
        //   e.preventDefault()
        // }}
      >
        <TrashSimple
          width={20}
          height={20}
          color={theme.colors.thTextContrast2.toString()}
        />
        Delete
      </Button>
      <Button
        style="cancel"
        onClick={(e) => {
          props.setMultiSelectMode('off')
          e.preventDefault()
        }}
      >
        <Prohibit
          width={20}
          height={20}
          color={theme.colors.thTextContrast2.toString()}
        />
        Cancel
      </Button>
    </HStack>
  )
}

function SearchControlButtonBox(props: ControlButtonBoxProps): JSX.Element {
  return (
    <>
      <SearchBox searchTerm="" applySearchQuery={(searchQuery: string) => {}} />
      <Button
        style="plainIcon"
        css={{ display: 'flex', marginLeft: 'auto' }}
        onClick={(e) => {
          props.updateLayout(
            props.layout == 'GRID_LAYOUT' ? 'LIST_LAYOUT' : 'GRID_LAYOUT'
          )
          e.preventDefault()
        }}
      >
        {props.layout == 'GRID_LAYOUT' ? (
          <ListBullets
            width={30}
            height={30}
            weight="light"
            color={'#898989'}
          />
        ) : (
          <SquaresFour
            width={30}
            height={30}
            weight="light"
            color={'#898989'}
          />
        )}
      </Button>
      <PrimaryDropdown
        showThemeSection={true}
        startSelectMultiple={() => {
          props.setMultiSelectMode('none')
        }}
        showAddLinkModal={props.showAddLinkModal}
      />
    </>
  )
}

function ControlButtonBox(props: ControlButtonBoxProps): JSX.Element {
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    if (props.multiSelectMode === 'off' || props.multiSelectMode === 'none') {
      setIsChecked(false)
    }
  }, [props.multiSelectMode])

  const breakpoints =
    props.layout == 'GRID_LAYOUT'
      ? {
          minWidth: '121px',

          '@xlgDown': {
            width: '320px',
          },
          '@smDown': {
            width: '320px',
          },
          '@media (min-width: 930px)': {
            width: '640px',
          },
          '@media (min-width: 1280px)': {
            width: '1000px',
          },
          '@media (min-width: 1600px)': {
            width: '1340px',
          },
        }
      : {
          width: '900px',
          '@xlgDown': {
            width: '90%',
          },
          '@xxl': {
            width: '1200px',
          },
        }
  return (
    <>
      <HStack
        alignment="center"
        distribution={props.multiSelectMode !== 'off' ? 'center' : 'start'}
        css={{
          gap: '10px',
          '@mdDown': {
            display: 'none',
          },
          ...breakpoints,
        }}
      >
        {props.multiSelectMode !== 'off' && (
          <SpanBox
            css={{
              flex: 1,
              display: 'flex',
              gap: '2px',
              alignItems: 'center',
            }}
          >
            <CardCheckbox
              isChecked={isChecked}
              handleChanged={() => {
                const newValue = !isChecked
                props.setMultiSelectMode(newValue ? 'visible' : 'none')
                setIsChecked(newValue)
              }}
            />
            <SpanBox css={{ pt: '2px' }}>
              <Dropdown
                triggerElement={
                  <CaretDown
                    size={15}
                    color={theme.colors.thBorderSubtle.toString()}
                    weight="fill"
                  />
                }
              >
                <DropdownOption
                  onSelect={() => {
                    setIsChecked(true)
                    props.setMultiSelectMode('visible')
                  }}
                  title="All"
                />
                <DropdownOption
                  onSelect={() => {
                    setIsChecked(true)
                    props.setMultiSelectMode('search')
                  }}
                  title="All matching search"
                />
              </Dropdown>
            </SpanBox>
            <SpanBox
              css={{
                paddingLeft: '10px',
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: '$inter',
              }}
            >
              {props.numItemsSelected} selected
            </SpanBox>
          </SpanBox>
        )}
        {props.multiSelectMode !== 'off' ? (
          <>
            <MultiSelectControlButtonBox
              {...props}
              // setInMultiSelect={(set: boolean) => {
              //   setIsChecked(false)
              //   props.setInMultiSelect(set)
              // }}
            />
            <SpanBox css={{ flex: 1 }}></SpanBox>
          </>
        ) : (
          <SearchControlButtonBox {...props} />
        )}
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
            startSelectMultiple={() => {
              props.setMultiSelectMode('none')
            }}
          />
        </HStack>
      )}
    </>
  )
}
