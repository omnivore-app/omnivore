import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from './../../elements/ModalPrimitives'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CommentIcon } from '../../elements/images/CommentIcon'
import { theme } from '../../tokens/stitches.config'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { useCallback, useState } from 'react'
import { StyledTextArea } from '../../elements/StyledTextArea'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import { readableUpdatedAtMessage } from './../../../lib/dateFormatting'
import { useConfirmListener } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { showErrorToast } from '../../../lib/toastHelpers'
import { CrossIcon } from '../../elements/images/CrossIcon'

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
        showErrorToast('Error updating your note', { position: 'bottom-right' })
      }
    } if (!props.highlight && props.createHighlightForNote) {
      const result = await props.createHighlightForNote(noteContent)
      if (result) {
        props.onOpenChange(true)
      } else {
        showErrorToast('Error saving highlight', { position: 'bottom-right' })
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
        <VStack>
          <HStack
            distribution="between"
            alignment="center"
            css={{ width: '100%' }}
          >
            <StyledText style="modalHeadline" css={{ p: '16px' }}>
              Notes
            </StyledText>
            <Button
              css={{ pt: '16px', pr: '16px' }}
              style="ghost"
              onClick={() => {
                props.onOpenChange(false)
              }}
            >
              <CrossIcon
                size={20}
                strokeColor={theme.colors.grayText.toString()}
              />
            </Button>
          </HStack>
          <SpanBox css={{ width: '100%', height: '1px', opacity: '0.2', backgroundColor: theme.colors.grayText.toString() }} />
          <StyledTextArea
            css={{
              mt: '$2',
              width: '95%',
              p: '0px',
              height: '$6',
              marginLeft: '16px',
            }}
            autoFocus
            placeholder={'Add your note here'}
            value={noteContent}
            onChange={handleNoteContentChange}
            maxLength={4000}
          />
            <SpanBox css={{ width: '100%', height: '1px', opacity: '0.2', backgroundColor: theme.colors.grayText.toString() }} />
          <HStack
            alignment="end"
            distribution="end"
            css={{
              width: '100%',
              padding: '22px 22px 20px 0',
            }}
          >
            <Button style={'ctaDarkYellow'} onClick={saveNoteChanges}>
              Save
            </Button>
          </HStack>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
