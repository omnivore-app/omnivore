import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
  ModalTitleBar,
} from '../../elements/ModalPrimitives'
import { Box, HStack, VStack, SpanBox } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { TrashIcon } from '../../elements/images/TrashIcon'
import { theme } from '../../tokens/stitches.config'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../../patterns/HighlightView'
import { useCallback, useMemo, useState } from 'react'
import { StyledTextArea } from '../../elements/StyledTextArea'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { DotsThree } from 'phosphor-react'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { SetLabelsModal } from './SetLabelsModal'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { setLabelsForHighlight } from '../../../lib/networking/mutations/setLabelsForHighlight'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { diff_match_patch } from 'diff-match-patch'
import { HighlightNoteTextEditArea } from '../../elements/HighlightNoteTextEditArea'

type NotebookModalProps = {
  highlights: Highlight[]
  scrollToHighlight?: (arg: string) => void
  updateHighlight: (highlight: Highlight) => void
  deleteHighlightAction?: (highlightId: string) => void
  onOpenChange: (open: boolean) => void
}

export const getHighlightLocation = (patch: string): number | undefined => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || undefined
}

export function NotebookModal(props: NotebookModalProps): JSX.Element {
  const [showConfirmDeleteHighlightId, setShowConfirmDeleteHighlightId] =
    useState<undefined | string>(undefined)
  const [labelsTarget, setLabelsTarget] = useState<Highlight | undefined>(
    undefined
  )
  const [, updateState] = useState({})

  const sortedHighlights = useMemo(() => {
    const sorted = (a: number, b: number) => {
      if (a < b) {
        return -1
      }
      if (a > b) {
        return 1
      }
      return 0
    }

    return props.highlights.sort((a: Highlight, b: Highlight) => {
      if (a.highlightPositionPercent && b.highlightPositionPercent) {
        return sorted(a.highlightPositionPercent, b.highlightPositionPercent)
      }
      // We do this in a try/catch because it might be an invalid diff
      // With PDF it will definitely be an invalid diff.
      try {
        const aPos = getHighlightLocation(a.patch)
        const bPos = getHighlightLocation(b.patch)
        if (aPos && bPos) {
          return sorted(aPos, bPos)
        }
      } catch {}
      return a.createdAt.localeCompare(b.createdAt)
    })
  }, [props.highlights])

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
          <Box css={{ overflow: 'auto', width: '100%' }}>
            {sortedHighlights.map((highlight) => (
              <ModalHighlightView
                key={highlight.id}
                highlight={highlight}
                showDelete={!!props.deleteHighlightAction}
                scrollToHighlight={props.scrollToHighlight}
                setSetLabelsTarget={setLabelsTarget}
                setShowConfirmDeleteHighlightId={
                  setShowConfirmDeleteHighlightId
                }
                deleteHighlightAction={() => {
                  if (props.deleteHighlightAction) {
                    props.deleteHighlightAction(highlight.id)
                  }
                }}
                updateHighlight={props.updateHighlight}
              />
            ))}
            {sortedHighlights.length === 0 && (
              <SpanBox css={{ textAlign: 'center', width: '100%' }}>
                <StyledText css={{ mb: '40px' }}>
                  You have not added any highlights or notes to this document
                </StyledText>
              </SpanBox>
            )}
          </Box>
        </VStack>
      </ModalContent>
      {showConfirmDeleteHighlightId && (
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
      )}
      {labelsTarget && (
        <SetLabelsModal
          provider={labelsTarget}
          onOpenChange={function (open: boolean): void {
            setLabelsTarget(undefined)
          }}
          onLabelsUpdated={function (labels: Label[]): void {
            updateState({})
          }}
          save={function (labels: Label[]): Promise<Label[] | undefined> {
            const result = setLabelsForHighlight(
              labelsTarget.id,
              labels.map((label) => label.id)
            )
            return result
          }}
        />
      )}
    </ModalRoot>
  )
}

type ModalHighlightViewProps = {
  highlight: Highlight
  showDelete: boolean
  scrollToHighlight?: (arg: string) => void
  deleteHighlightAction: () => void
  updateHighlight: (highlight: Highlight) => void

  setSetLabelsTarget: (highlight: Highlight) => void
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
              onSelect={async () => {
                await copyHighlight()
              }}
              title="Copy"
            />
            <DropdownOption
              onSelect={() => {
                props.setSetLabelsTarget(props.highlight)
              }}
              title="Labels"
            />
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
              borderRadius: '5px',
              p: '16px',
              width: '100%',
              marginTop: '24px',
              bg: '#EBEBEB',
              color: '#3D3D3D',
            }}
            onClick={() => setIsEditing(true)}
          >
            {props.highlight.annotation
              ? props.highlight.annotation
              : 'Add your notes...'}
          </StyledText>
        ) : null}
        {isEditing && (
          <HighlightNoteTextEditArea
            setIsEditing={setIsEditing}
            highlight={props.highlight}
            updateHighlight={props.updateHighlight}
          />
        )}
        <SpanBox css={{ mt: '$2', mb: '$4' }} />
      </VStack>
    </>
  )
}
