import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from './../../elements/ModalPrimitives'
import { Box, HStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CommentIcon } from '../../elements/images/CommentIcon'
import { theme } from '../../tokens/stitches.config'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../../patterns/HighlightView'
import { useCallback, useState } from 'react'
import { StyledTextArea } from '../../elements/StyledTextArea'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import { readableUpdatedAtMessage } from './../../../lib/dateFormatting'
import { useConfirmListener } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import toast from 'react-hot-toast'

type HighlightNoteModalProps = {
  author: string
  title: string
  highlight?: Highlight
  onUpdate: (updatedHighlight: Highlight) => void
  onOpenChange: (open: boolean) => void
  createHighlightForNote?: (note?: string) => Promise<Highlight | undefined>
}

export function HighlightNoteModal(
  props: HighlightNoteModalProps
): JSX.Element {
  const [noteContent, setNoteContent] = useState(
    props.highlight?.annotation ?? ''
  )

  useConfirmListener(() => {
    saveNoteChanges()
  }, undefined, true)

  const updatedAtMessage = props.highlight ? readableUpdatedAtMessage(props.highlight?.updatedAt) : undefined

  const handleNoteContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setNoteContent(event.target.value)
    },
    [setNoteContent]
  )

  const saveNoteChanges = useCallback(async () => {
    if (noteContent != props.highlight?.annotation && props.highlight?.id) {
      const result = await updateHighlightMutation({
        highlightId: props.highlight?.id,
        annotation: noteContent,
      })

      if (result) {
        props.onUpdate({ ...props.highlight, annotation: noteContent })
        props.onOpenChange(false)
      } else {
        toast.error('Error updating your note', { position: 'bottom-right' })
      }
    } if (!props.highlight && props.createHighlightForNote) {
      const result = await props.createHighlightForNote(noteContent)
      if (result) {
        props.onOpenChange(true)
      } else {
        toast.error('Error saving highlight', { position: 'bottom-right' })
      }
    } else {
      props.onOpenChange(false)
    }
  }, [noteContent, props])

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{ overflow: 'auto' }}
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
      >
        <HighlightNoteModalHeader
          headlineText='Notes'
          saveNoteChanges={saveNoteChanges}
          onOpenChange={props.onOpenChange}
        />
          {props.highlight && (
            <Box css={{
              width: '100%',
              '@mdDown':{
                display: 'none',
              },
            }}>
              <HighlightView {...props} highlight={props.highlight} />
            </Box>
          )}
          <StyledTextArea
            css={{
              mt: '$2',
              width: '95%',
              p: '$1',
              height: '$6',
            }}
            autoFocus
            placeholder={'Add your note here'}
            value={noteContent}
            onChange={handleNoteContentChange}
            maxLength={4000}
          />
        {updatedAtMessage ? (
          <StyledText style="caption">{updatedAtMessage}</StyledText>
        ) : null}
      </ModalContent>
    </ModalRoot>
  )
}

type HighlightNoteModalHeaderProps = {
  headlineText: string
  saveNoteChanges: () => void
  onOpenChange: (open: boolean) => void
}

function HighlightNoteModalHeader(
  props: HighlightNoteModalHeaderProps
): JSX.Element {
  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
      }}
    >
      <Button
        style="ctaSecondary"
        onClick={() => {
          props.onOpenChange(false)
        }}
        css={{ justifySelf: 'start' }}
      >
        Cancel
      </Button>
      <HStack alignment="center">
        <CommentIcon
          size={24}
          strokeColor={theme.colors.grayTextContrast.toString()}
        />
        <StyledText>&nbsp; {props.headlineText}</StyledText>
      </HStack>
      <Button
        style="ctaSecondary"
        onClick={props.saveNoteChanges}
        css={{ justifySelf: 'end' }}
      >
        Save
      </Button>
    </Box>
  )
}
