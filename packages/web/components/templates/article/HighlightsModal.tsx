import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
  ModalTitleBar,
} from '../../elements/ModalPrimitives'
import {
  Box,
  HStack,
  VStack,
  Separator,
  SpanBox,
} from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { CommentIcon } from '../../elements/images/CommentIcon'
import { TrashIcon } from '../../elements/images/TrashIcon'
import { theme } from '../../tokens/stitches.config'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../../patterns/HighlightView'
import { useCallback, useRef, useState } from 'react'
import { StyledTextArea } from '../../elements/StyledTextArea'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { DotsThree, Pen, Trash } from 'phosphor-react'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'

type HighlightsModalProps = {
  highlights: Highlight[]
  scrollToHighlight?: (arg: string) => void
  deleteHighlightAction?: (highlightId: string) => void
  onOpenChange: (open: boolean) => void
}

export function HighlightsModal(props: HighlightsModalProps): JSX.Element {
  const [showConfirmDeleteHighlightId, setShowConfirmDeleteHighlightId] =
    useState<undefined | string>(undefined)

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
          props.onOpenChange(false)
        }}
        css={{ overflow: 'auto', px: '24px' }}
      >
        <VStack distribution="start" css={{ height: '100%' }}>
          <ModalTitleBar title="Notebook" onOpenChange={props.onOpenChange} />
          <Box css={{ overflow: 'auto', mt: '24px', width: '100%' }}>
            {props.highlights.map((highlight) => (
              <ModalHighlightView
                key={highlight.id}
                highlight={highlight}
                showDelete={!!props.deleteHighlightAction}
                scrollToHighlight={props.scrollToHighlight}
                setShowConfirmDeleteHighlightId={
                  setShowConfirmDeleteHighlightId
                }
                deleteHighlightAction={() => {
                  if (props.deleteHighlightAction) {
                    props.deleteHighlightAction(highlight.id)
                  }
                }}
              />
            ))}
            {props.highlights.length === 0 && (
              <SpanBox css={{ textAlign: 'center', width: '100%' }}>
                <StyledText css={{ mb: '40px' }}>
                  You have not added any highlights or notes to this document
                </StyledText>
              </SpanBox>
            )}
          </Box>
        </VStack>
      </ModalContent>
      {showConfirmDeleteHighlightId ? (
        <ConfirmationModal
          message={'Are you sure you want to delete this highlight?'}
          onAccept={() => {
            if (props.deleteHighlightAction) {
              props.deleteHighlightAction(showConfirmDeleteHighlightId)
            }
            setShowConfirmDeleteHighlightId(undefined)
          }}
          onOpenChange={() => setShowConfirmDeleteHighlightId(undefined)}
          icon={
            <TrashIcon
              size={40}
              strokeColor={theme.colors.grayTextContrast.toString()}
            />
          }
        />
      ) : null}
    </ModalRoot>
  )
}

type ModalHighlightViewProps = {
  highlight: Highlight
  showDelete: boolean
  scrollToHighlight?: (arg: string) => void
  deleteHighlightAction: () => void
  setShowConfirmDeleteHighlightId: (id: string | undefined) => void
}

function ModalHighlightView(props: ModalHighlightViewProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)

  const copyHighlight = useCallback(async () => {
    await navigator.clipboard.writeText(props.highlight.quote)
  }, [props.highlight])

  return (
    <>
      <VStack>
        <SpanBox css={{ marginLeft: 'auto' }}>
          <Dropdown
            triggerElement={
              <DotsThree size={24} color={theme.colors.readerFont.toString()} />
            }
          >
            <DropdownOption
              onSelect={() => {
                copyHighlight()
              }}
              title="Copy"
            />
            {/* <DropdownOption onSelect={() => {}} title="Labels" /> */}
            <DropdownOption
              onSelect={() => {
                props.setShowConfirmDeleteHighlightId(props.highlight.id)
              }}
              title="Delete"
            />
          </Dropdown>
        </SpanBox>

        <HighlightView
          scrollToHighlight={props.scrollToHighlight}
          highlight={props.highlight}
        />
        {!isEditing ? (
          <StyledText
            css={{
              borderRadius: '6px',
              bg: '$grayBase',
              p: '16px',
              width: '100%',
              marginTop: '16px',
              color: '$grayText',
            }}
            onClick={() => setIsEditing(true)}
          >
            {props.highlight.annotation ?? 'Add your notes...'}
          </StyledText>
        ) : null}
        {isEditing && (
          <TextEditArea
            highlight={props.highlight}
            setIsEditing={setIsEditing}
          />
        )}
        <SpanBox css={{ mt: '$2', mb: '$4' }} />
      </VStack>
    </>
  )
}

type TextEditAreaProps = {
  setIsEditing: (editing: boolean) => void
  highlight: Highlight
}

const TextEditArea = (props: TextEditAreaProps): JSX.Element => {
  const [noteContent, setNoteContent] = useState(
    props.highlight.annotation ?? ''
  )

  const handleNoteContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setNoteContent(event.target.value)
    },
    [setNoteContent]
  )

  return (
    <VStack css={{ width: '100%' }} key="textEditor">
      <StyledTextArea
        css={{
          my: '$3',
          minHeight: '$6',
          borderRadius: '6px',
          bg: '$grayBase',
          p: '16px',
          width: '100%',
          marginTop: '16px',
          resize: 'vertical',
        }}
        autoFocus
        maxLength={4000}
        value={noteContent}
        placeholder={'Add your notes...'}
        onChange={handleNoteContentChange}
      />
      <HStack alignment="center" distribution="end" css={{ width: '100%' }}>
        <Button
          style="ctaPill"
          css={{ mr: '$2' }}
          onClick={() => {
            props.setIsEditing(false)
            setNoteContent(props.highlight.annotation ?? '')
          }}
        >
          Cancel
        </Button>
        <Button style="ctaDarkYellow">Save</Button>
      </HStack>
    </VStack>
  )
}
