import {
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { SearchIcon } from '../../elements/images/SearchIcon'
import { theme } from '../../tokens/stitches.config'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { FormInput } from '../../elements/FormElements'
import { searchBarCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { Button, IconButton } from '../../elements/Button'
import { MagnifyingGlass, Textbox, X } from 'phosphor-react'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'
import { OmnivoreFullLogo } from '../../elements/images/OmnivoreFullLogo'
import { AvatarDropdown } from '../../elements/AvatarDropdown'
import { ListSelectorIcon } from '../../elements/images/ListSelectorIcon'
import { GridSelectorIcon } from '../../elements/images/GridSelectorIcon'

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
  | `sort:read`

// get last week's date
const recentlySavedStartDate = new Date(
  new Date().getTime() - 7 * 24 * 60 * 60 * 1000
).toLocaleDateString('en-US')

const FOCUSED_BOXSHADOW = '0px 0px 2px 2px rgba(255, 234, 159, 0.56)'

export function LibraryHeader(props: LibrarySearchBarProps): JSX.Element {
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
    <VStack
      alignment="center"
      distribution="start"
      css={{
        top: '0',
        left: '0',
        zIndex: 100,
        position: 'fixed',
        width: '100%',
        height: '105px',
        bg: 'white',
        pt: '50px',
        borderBottom: '1px solid #E1E1E1',
        '@mdDown': {
          height: '40px',
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
        <ControlButtonBox />
      </HStack>
    </VStack>
  )
}

function SearchBox(props: LibrarySearchBarProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
        {searchTerm ? (
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
              // onClick={() => requestAnimationFrame(() => inputRef.current.focus())}
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
          ml: '25px',
          height: '24px',
          width: '232px',
          minWidth: '232px',
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
          height: '22px',
          width: '22px',
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

function ControlButtonBox(): JSX.Element {
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
        <ListSelectorIcon />
        <GridSelectorIcon />
        <AvatarDropdown userInitials="JH" />
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
        <AvatarDropdown userInitials="JH" />
      </HStack>
    </>
  )
}
