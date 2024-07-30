import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
  ModalTitleBar,
  ModalButtonBar,
} from './../../elements/ModalPrimitives'
import { VStack } from '../../elements/LayoutPrimitives'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { useCallback, useState } from 'react'
import { StyledTextArea } from '../../elements/StyledTextArea'
import { showErrorToast } from '../../../lib/toastHelpers'
import { useUpdateHighlight } from '../../../lib/networking/highlights/useItemHighlights'

type HighlightNoteModalProps = {
  highlight?: Highlight
  libraryItemId: string
  libraryItemSlug: string
  onUpdate: (updatedHighlight: Highlight) => void
  onOpenChange: (open: boolean) => void
  createHighlightForNote?: (note?: string) => Promise<Highlight | undefined>
}

export function HighlightNoteModal(
  props: HighlightNoteModalProps
): JSX.Element {
  const updateHighlight = useUpdateHighlight()
  const [noteContent, setNoteContent] = useState(
    props.highlight?.annotation ?? ''
  )

  const handleNoteContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setNoteContent(event.target.value)
    },
    [setNoteContent]
  )

  const saveNoteChanges = useCallback(async () => {
    if (noteContent != props.highlight?.annotation && props.highlight?.id) {
      console.log('updating highlight textsdsdfsd')
      try {
        const result = await updateHighlight.mutateAsync({
          itemId: props.libraryItemId,
          slug: props.libraryItemSlug,
          input: {
            libraryItemId: props.libraryItemId,
            highlightId: props.highlight?.id,
            annotation: noteContent,
            color: props.highlight?.color,
          },
        })
        props.onUpdate({ ...props.highlight, annotation: noteContent })
        props.onOpenChange(false)
        return result?.id
      } catch (err) {
        showErrorToast('Error updating your note', { position: 'bottom-right' })
        return undefined
      }
    }
    if (!props.highlight && props.createHighlightForNote) {
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
        css={{ bg: '$grayBg', px: '24px' }}
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          props.onOpenChange(false)
          event.preventDefault()
          event.stopPropagation()
        }}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault()
            saveNoteChanges()
            props.onOpenChange(false)
          }
        }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            saveNoteChanges()
            props.onOpenChange(false)
          }}
        >
          <VStack>
            <ModalTitleBar title="Notes" onOpenChange={props.onOpenChange} />
            <StyledTextArea
              css={{
                mt: '16px',
                p: '6px',
                width: '100%',
                height: '248px',
                fontSize: '14px',
                border: '1px solid $textNonessential',
                borderRadius: '6px',
              }}
              autoFocus
              placeholder={'Add your note here'}
              value={noteContent}
              onChange={handleNoteContentChange}
              maxLength={4000}
            />
            <ModalButtonBar
              onOpenChange={props.onOpenChange}
              acceptButtonLabel="Save"
            />
          </VStack>
        </form>
      </ModalContent>
    </ModalRoot>
  )
}
