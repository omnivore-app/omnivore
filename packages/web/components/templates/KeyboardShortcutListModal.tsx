/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../elements/ModalPrimitives'
import type { KeyboardCommand } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { HStack, VStack, Box } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { Button } from '../elements/Button'
import { CrossIcon } from '../elements/images/CrossIcon'
import { theme } from '../tokens/stitches.config'
import {
  navigationCommands,
  searchBarCommands,
  primaryCommands,
  libraryListCommands,
  highlightBarKeyboardCommands,
  articleKeyboardCommands,
} from '../../lib/keyboardShortcuts/navigationShortcuts'
import { useRouter } from 'next/router'

type KeyboardShortcutListModalProps = {
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutListModal(
  props: KeyboardShortcutListModalProps
): JSX.Element {
  const router = useRouter()

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent css={{ overflow: 'auto', bg: '$grayBase' }}>
        <VStack>
          <HStack
            distribution="between"
            css={{
              pt: '$2',
              px: '$1',
              width: '100%',
            }}
          >
            <StyledText css={{ my: '$2', mx: 0 }} style="modalHeadline">
              Keyboard Shortcuts
            </StyledText>
            <Button
              css={{ pt: '$2' }}
              style="ghost"
              onClick={() => {
                props.onOpenChange(false)
              }}
            >
              <CrossIcon
                size={20}
                strokeColor={theme.colors.grayTextContrast.toString()}
              />
            </Button>
          </HStack>
          <ShortcutListSection
            title="Navigation"
            commands={navigationCommands(undefined)}
          />
          <ShortcutListSection
            title="Preferences"
            commands={primaryCommands(() => {})}
          />
          <ShortcutListSection
            title="Library"
            commands={searchBarCommands(() => {}).concat(
              libraryListCommands(() => {})
            )}
          />
          <ShortcutListSection
            title="Article"
            commands={articleKeyboardCommands(router, () => {})}
          />
          <ShortcutListSection
            title="Highlight Bar"
            commands={highlightBarKeyboardCommands(() => {})}
          />
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
          pl: '$2',
          pt: '$3',
          borderTop: '1px solid $grayBorder',
          width: '100%',
          my: '$2',
        }}
      >
        {props.title}
      </StyledText>
      {props.commands.map((command, index) => (
        <Box
          css={{
            width: '100%',
            px: '$3',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
          }}
          key={index}
        >
          <StyledText css={{ my: '$2' }}>
            {command.actionDescription}
          </StyledText>
          <StyledText css={{ my: '$2' }}>
            {command.shortcutKeyDescription}
          </StyledText>
        </Box>
      ))}
    </>
  )
}
