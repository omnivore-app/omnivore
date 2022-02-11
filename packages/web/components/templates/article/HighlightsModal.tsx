import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
} from '../../elements/ModalPrimitives'
import { Box, HStack, VStack, Separator, SpanBox } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { CommentIcon } from '../../elements/images/CommentIcon'
import { TrashIcon } from '../../elements/images/TrashIcon'
import { theme } from '../../tokens/stitches.config'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../../patterns/HighlightView'
import { useCallback, useState } from 'react'
import { StyledTextArea } from '../../elements/StyledTextArea'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { Pen, Trash } from 'phosphor-react'

type HighlightsModalProps = {
  highlights: Highlight[]
  deleteHighlightAction: (highlightId: string) => void
  onOpenChange: (open: boolean) => void
}

export function HighlightsModal(props: HighlightsModalProps): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
        css={{ overflow: 'auto', p: '0' }}
      >
        <VStack distribution="start" css={{ height: '100%' }}>
          <HStack
            distribution="between"
            alignment="center"
            css={{ width: '100%' }}
          >
            <StyledText style="modalHeadline" css={{ p: '16px' }}>All your highlights and notes</StyledText>
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
          <Box css={{ overflow: 'auto', mt: '$2', width: '100%' }}>
            {props.highlights.map((highlight) => (
              <ModalHighlightView
                key={highlight.id}
                highlight={highlight}
                deleteHighlightAction={() =>
                  props.deleteHighlightAction(highlight.id)
                }
              />
            ))}
            {props.highlights.length === 0 && (
              <SpanBox css={{ textAlign: 'center', width: '100%',  }}>
                <StyledText css={{ mb: '40px' }}>You have not added any highlights or notes to this document</StyledText>
              </SpanBox>
            )}
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}

type ModalHighlightViewProps = {
  highlight: Highlight
  deleteHighlightAction: () => void
}

function ModalHighlightView(props: ModalHighlightViewProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const [noteContent, setNoteContent] = useState(
    props.highlight.annotation ?? ''
  )

  const handleNoteContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setNoteContent(event.target.value)
    },
    [setNoteContent]
  )

  const ButtonStack = (): JSX.Element => (
    <HStack
      alignment="center"
      distribution="end"
      css={{ width: '100%', pt: '$2' }}
    >
      {/* <Button style="ghost" onClick={() => setIsEditing(true)}>
        {props.highlight.annotation ? (
          <Pen width={18} height={18} color={theme.colors.grayText.toString()} />
        ) : (
          <CommentIcon
            size={24}
            strokeColor={theme.colors.grayTextContrast.toString()}
          />
        )}
      </Button> */}
      <Button style="ghost" onClick={() => setShowDeleteConfirmation(true)}>
        <Trash width={18} height={18} color={theme.colors.grayText.toString()} />
      </Button>
    </HStack>
  )

  const TextEditArea = (): JSX.Element => (
    <VStack css={{ width: '100%' }}>
      <StyledTextArea
        css={{
          mx: '21px',
          my: '$3',
          width: '95%',
          p: '$1',
          minHeight: '$6',
        }}
        autoFocus
        placeholder={'Add your note here'}
        value={noteContent}
        onChange={handleNoteContentChange}
        maxLength={4000}
      />
      <HStack alignment="center" distribution="end" css={{ width: '100%' }}>
        <Button
          style="ctaPill"
          css={{ mr: '$2' }}
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
        <Button style="ctaDarkYellow">Save</Button>
      </HStack>
    </VStack>
  )

  return (
    <>
      <VStack>
        <HighlightView highlight={props.highlight} />
        {props.highlight.annotation && !isEditing ? (
          <StyledText css={{ px: '24px' }}>{props.highlight.annotation}</StyledText>
        ) : null}
        {isEditing ? <TextEditArea /> : <ButtonStack />}
        <Separator css={{ mt: '$2', mb: '$4' }} />
        {showDeleteConfirmation ? (
          <ConfirmationModal
            message={'Are you sure you want to delete this highlight?'}
            onAccept={() => {
              setShowDeleteConfirmation(false)
              props.deleteHighlightAction()
            }}
            onOpenChange={() => setShowDeleteConfirmation(false)}
            icon={
              <TrashIcon
                size={40}
                strokeColor={theme.colors.grayTextContrast.toString()}
              />
            }
          />
        ) : null}
      </VStack>
    </>
  )
}
