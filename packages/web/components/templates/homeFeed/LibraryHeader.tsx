import { useEffect, useRef, useState } from 'react'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { theme } from '../../tokens/stitches.config'
import { FormInput } from '../../elements/FormElements'
import { searchBarCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { Button, IconButton } from '../../elements/Button'
import { FunnelSimple, X } from 'phosphor-react'
import { LayoutType, LibraryMode } from './HomeFeedContainer'
import { OmnivoreSmallLogo } from '../../elements/images/OmnivoreNameLogo'
import { DEFAULT_HEADER_HEIGHT, HeaderSpacer } from './HeaderSpacer'
import { LIBRARY_LEFT_MENU_WIDTH } from '../navMenu/LibraryMenu'
import { BulkAction } from '../../../lib/networking/mutations/bulkActionMutation'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { AddBulkLabelsModal } from '../article/AddBulkLabelsModal'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { ArchiveIcon } from '../../elements/icons/ArchiveIcon'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { LabelIcon } from '../../elements/icons/LabelIcon'
import { HeaderCheckboxIcon } from '../../elements/icons/HeaderCheckboxIcon'
import { HeaderToggleGridIcon } from '../../elements/icons/HeaderToggleGridIcon'
import { HeaderToggleListIcon } from '../../elements/icons/HeaderToggleListIcon'
import { HeaderToggleTLDRIcon } from '../../elements/icons/HeaderToggleTLDRIcon'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'

export type MultiSelectMode = 'off' | 'none' | 'some' | 'visible' | 'search'

type LibraryHeaderProps = {
  viewer: UserBasicData | undefined

  layout: LayoutType
  updateLayout: (layout: LayoutType) => void

  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void

  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void

  mode: LibraryMode
  setMode: (set: LibraryMode) => void

  numItemsSelected: number
  multiSelectMode: MultiSelectMode
  setMultiSelectMode: (mode: MultiSelectMode) => void

  performMultiSelectAction: (action: BulkAction, labelIds?: string[]) => void
}

export const headerControlWidths = (
  layout: LayoutType,
  multiSelectMode: MultiSelectMode
) => {
  return {
    width: '95%',
    '@mdDown': {
      padding: '15px',
      width: '100%',
    },
    '@media (min-width: 930px)': {
      width: '620px',
    },
    '@media (min-width: 1280px)': {
      width: '940px',
    },
    '@media (min-width: 1600px)': {
      width: '1232px',
    },
  }
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
          top: '0',
          right: '0',
          zIndex: 5,
          px: '70px',
          bg: '$thLibraryBackground',
          position: 'fixed',
          left: LIBRARY_LEFT_MENU_WIDTH,
          height: small ? '60px' : DEFAULT_HEADER_HEIGHT,
          transition: 'height 0.5s',
          '@lgDown': { px: '20px' },
          '@mdDown': {
            px: '10px',
            left: '0px',
            right: '0',
          },
        }}
      >
        <LargeHeaderLayout {...props} />
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
      distribution="start"
      css={{
        gap: '10px',
        height: '100%',
        ...headerControlWidths(props.layout, props.multiSelectMode),
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

const CheckBoxButton = (props: LibraryHeaderProps): JSX.Element => {
  const color = theme.colors.thLibraryMenuUnselected.toString()
  return (
    <Button
      title="Select multiple"
      style="plainIcon"
      css={{ display: 'flex', '&:hover': { opacity: '1.0' } }}
      onClick={(e) => {
        switch (props.multiSelectMode) {
          case 'off':
          case 'none':
          case 'some':
            props.setMultiSelectMode('visible')
            break
          default:
            props.setMultiSelectMode('off')
            break
        }
        e.preventDefault()
      }}
    >
      <HeaderCheckboxIcon
        multiSelectMode={props.multiSelectMode}
        color={color}
      />
    </Button>
  )
}

const HeaderControls = (props: LibraryHeaderProps): JSX.Element => {
  return (
    <>
      <SpanBox
        css={{
          display: 'none',
          '@mdDown': { display: 'flex' },
        }}
      >
        <MenuHeaderButton {...props} />
      </SpanBox>

      <SearchBox {...props} />

      <SpanBox css={{ display: 'flex', ml: 'auto', gap: '10px' }}>
        {props.viewer?.features.includes('ai-summaries') && (
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
        )}

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

export function SearchBox(props: LibraryHeaderProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState(false)
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
        bg: '$thLibrarySearchbox',
        borderRadius: '6px',
        boxShadow: focused
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
            border: focused
              ? '2px solid $searchActiveOutline'
              : '2px solid transparent',
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
          <HStack
            alignment="center"
            css={{
              py: '15px',
              marginLeft: 'auto',
            }}
          >
            <IconButton
              style="searchButton"
              onClick={(event) => {
                event.preventDefault()
                setSearchTerm('in:inbox')
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
          </HStack>
        </HStack>
      </HStack>
    </Box>
  )
}

function MultiSelectControls(props: LibraryHeaderProps): JSX.Element {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showLabelsModal, setShowLabelsModal] = useState(false)
  const compact = false

  return (
    <Box
      css={{
        height: '38px',
        width: '100%',
        maxWidth: '521px',
        bg: '$thLibrarySearchbox',
        borderRadius: '6px',
        boxShadow:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06);',
      }}
    >
      <HStack
        alignment="center"
        distribution="end"
        css={{
          width: '100%',
          height: '100%',
          pr: compact ? '5px' : '10px',
        }}
        onClick={(e) => {
          e.preventDefault()
        }}
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
            gap: '15px',
            pl: '15px',
            border: '2px solid transparent',
            width: '100%',
            height: '100%',
          }}
        >
          <SpanBox
            css={{
              fontSize: '14px',
              fontFamily: '$display',
              marginRight: 'auto',
            }}
          >
            {props.numItemsSelected} items selected
          </SpanBox>
          <Button
            title="Archive"
            css={{ display: 'flex' }}
            style="plainIcon"
            onClick={(e) => {
              props.performMultiSelectAction(BulkAction.ARCHIVE)
              e.preventDefault()
            }}
          >
            <ArchiveIcon
              size={20}
              color={theme.colors.thTextContrast2.toString()}
            />
          </Button>
          <Button
            title="Add labels"
            css={{ display: 'flex' }}
            style="plainIcon"
            onClick={(e) => {
              setShowLabelsModal(true)
              e.preventDefault()
            }}
          >
            <LabelIcon
              size={20}
              color={theme.colors.thTextContrast2.toString()}
            />
          </Button>
          <Button
            title="Delete"
            css={{ display: 'flex' }}
            style="plainIcon"
            onClick={(e) => {
              setShowConfirmDelete(true)
              e.preventDefault()
            }}
          >
            <TrashIcon
              size={20}
              color={theme.colors.thTextContrast2.toString()}
            />
          </Button>
          {showConfirmDelete && (
            <ConfirmationModal
              message={`You are about to delete ${props.numItemsSelected} items. All associated notes and highlights will be deleted.`}
              acceptButtonLabel={'Delete'}
              onAccept={() => {
                props.performMultiSelectAction(BulkAction.DELETE)
              }}
              onOpenChange={(open: boolean) => {
                setShowConfirmDelete(false)
              }}
            />
          )}
          {showLabelsModal && (
            <AddBulkLabelsModal
              bulkSetLabels={(labels: Label[]) => {
                const labelIds = labels.map((l) => l.id)
                props.performMultiSelectAction(BulkAction.ADD_LABELS, labelIds)
              }}
              onOpenChange={(open: boolean) => {
                setShowLabelsModal(false)
              }}
            />
          )}
          <Button
            title="Cancel"
            css={{ display: 'flex', mr: '10px' }}
            style="plainIcon"
            onClick={(event) => {
              props.setMultiSelectMode('off')
            }}
            tabIndex={-1}
          >
            <X
              width={20}
              height={20}
              color={theme.colors.thTextContrast2.toString()}
            />
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}
