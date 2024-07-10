/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
  ModalTitleBar,
} from '../elements/ModalPrimitives'
import type { KeyboardCommand } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { VStack, Box } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import {
  navigationCommands,
  searchBarCommands,
  primaryCommands,
  libraryListCommands,
  highlightBarKeyboardCommands,
} from '../../lib/keyboardShortcuts/navigationShortcuts'

type KeyboardShortcutListModalProps = {
  onOpenChange: (open: boolean) => void
}

const libraryItemCommands = () => {
  return [
    {
      shortcutKeys: ['e'],
      actionDescription: 'Toggle archive status',
      shortcutKeyDescription: 'e',
      callback: () => {},
    },
    {
      actionDescription: 'Remove item',
      shortcutKeys: ['#'],
      shortcutKeyDescription: '#',
      callback: () => {},
    },
    {
      actionDescription: 'Edit item labels',
      shortcutKeys: ['l'],
      shortcutKeyDescription: 'l',
      callback: () => {},
    },
    {
      actionDescription: 'Mark item as read',
      shortcutKeys: ['-'],
      shortcutKeyDescription: 'm then r',
      callback: () => {},
    },
    {
      actionDescription: 'Mark item as unread',
      shortcutKeys: ['_'],
      shortcutKeyDescription: 'm then u',
      callback: () => {},
    },
  ]
}

const readerCommands = () => {
  return [
    {
      shortcutKeys: ['e'],
      actionDescription: 'Toggle archive status',
      shortcutKeyDescription: 'e',
      callback: () => {},
    },

    {
      actionDescription: 'Open original article',
      shortcutKeys: ['o'],
      shortcutKeyDescription: 'o',
      callback: () => {},
    },
    {
      actionDescription: 'Read fullscreen',
      shortcutKeys: ['f'],
      shortcutKeyDescription: 'f',
      callback: () => {},
    },
    {
      actionDescription: 'Return to library',
      shortcutKeys: ['u'],
      shortcutKeyDescription: 'u',
      callback: () => {},
    },
    {
      actionDescription: 'Archive current item',
      shortcutKeys: ['e'],
      shortcutKeyDescription: 'e',
      callback: () => {},
    },
    {
      actionDescription: 'Mark current item as read',
      shortcutKeys: ['-'],
      shortcutKeyDescription: 'm then r',
      callback: () => {},
    },
    {
      actionDescription: 'Delete current item',
      shortcutKeys: ['#'],
      shortcutKeyDescription: '#',
      callback: () => {},
    },
    {
      actionDescription: 'Highlight selected text',
      shortcutKeys: ['h'],
      shortcutKeyDescription: 'h',
      callback: () => {},
    },
    {
      actionDescription: 'Scroll to next highlight',
      shortcutKeys: ['j'],
      shortcutKeyDescription: 'j',
      callback: () => {},
    },
    {
      actionDescription: 'Scroll to previous highlight',
      shortcutKeys: ['k'],
      shortcutKeyDescription: 'k',
      callback: () => {},
    },
    {
      actionDescription: 'Toggle Notebook open',
      shortcutKeys: ['t'],
      shortcutKeyDescription: 't',
      callback: () => {},
    },
    {
      actionDescription: 'Edit Info',
      shortcutKeys: ['i'],
      shortcutKeyDescription: 'i',
      callback: () => {},
    },
  ]
}

export function KeyboardShortcutListModal(
  props: KeyboardShortcutListModalProps
): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{
          bg: '$grayBg',
          px: '20px',
          minWidth: '650px',
          minHeight: '430px',
          height: '430px',
          '@mdDown': {
            minWidth: '320px',
          },
        }}
        onInteractOutside={(event) => {
          event.preventDefault()
        }}
      >
        <VStack
          distribution="start"
          css={{
            py: '20px',
            gap: '10px',
            width: '100%',
            height: '100%',
          }}
        >
          <ModalTitleBar
            title="Keyboard Shortcuts"
            onOpenChange={props.onOpenChange}
          />
          <VStack
            id="keyboard-shortcuts-ctr"
            distribution="start"
            css={{
              width: '100%',
              maxHeight: '100%',
              overflowY: 'scroll',
            }}
          >
            <ShortcutListSection
              title="Navigation"
              commands={navigationCommands(undefined).map((action) => {
                return {
                  shortcutKeys: action.shortcut ?? [],
                  callback: () => {},
                  actionDescription: action.name,
                  shortcutKeyDescription: (action.shortcut ?? []).join(','),
                }
              })}
            />
            <ShortcutListSection
              title="Preferences"
              commands={primaryCommands(() => {})}
            />
            <ShortcutListSection
              title="Library"
              commands={searchBarCommands(() => {})
                .concat(libraryListCommands(() => {}))
                .concat(libraryItemCommands())}
            />
            <ShortcutListSection title="Reader" commands={readerCommands()} />
            <ShortcutListSection
              title="Highlight Bar"
              commands={highlightBarKeyboardCommands(() => {})}
            />
          </VStack>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}

type ShortcutListSectionProps = {
  title: string
  commands: KeyboardCommand[]
}

function ShortcutListSection(props: ShortcutListSectionProps): JSX.Element {
  return (
    <>
      <StyledText
        style="shareTitle"
        css={{
          pt: '15px',
          borderTop: '1px solid $grayBorder',
          width: '100%',
          my: '15px',
        }}
      >
        {props.title}
      </StyledText>
      {props.commands.map((command, index) => (
        <Box
          css={{
            width: '100%',
            px: '15px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
          }}
          key={index}
        >
          <StyledText css={{ my: '10px' }}>
            {command.actionDescription}
          </StyledText>
          <StyledText css={{ my: '10px' }}>
            {command.shortcutKeyDescription}
          </StyledText>
        </Box>
      ))}
    </>
  )
}
