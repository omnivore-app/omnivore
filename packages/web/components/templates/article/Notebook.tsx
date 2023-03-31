import { Box, HStack, VStack, SpanBox } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { BookOpen, PencilLine, X } from 'phosphor-react'
import { SetLabelsModal } from './SetLabelsModal'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { setLabelsForHighlight } from '../../../lib/networking/mutations/setLabelsForHighlight'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { diff_match_patch } from 'diff-match-patch'
import { highlightsAsMarkdown } from '../homeFeed/HighlightItem'
import 'react-markdown-editor-lite/lib/index.css'
import { createHighlightMutation } from '../../../lib/networking/mutations/createHighlightMutation'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { HighlightNoteBox } from '../../patterns/HighlightNotes'
import { HighlightViewItem } from './HighlightViewItem'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { TrashIcon } from '../../elements/images/TrashIcon'

type NotebookProps = {
  pageId: string
  highlights: Highlight[]
  scrollToHighlight?: (arg: string) => void

  sizeMode: 'normal' | 'maximized'

  onAnnotationsChanged?: (
    highlights: Highlight[],
    deletedAnnotations: Highlight[]
  ) => void
}

export const getHighlightLocation = (patch: string): number | undefined => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || undefined
}

type AnnotationInfo = {
  loaded: boolean

  note: Highlight | undefined
  noteId: string

  allAnnotations: Highlight[]
  deletedAnnotations: Highlight[]
}

export function Notebook(props: NotebookProps): JSX.Element {
  const [showConfirmDeleteHighlightId, setShowConfirmDeleteHighlightId] =
    useState<undefined | string>(undefined)
  const [labelsTarget, setLabelsTarget] =
    useState<Highlight | undefined>(undefined)
  const [showConfirmDeleteNote, setShowConfirmDeleteNote] = useState(false)
  const [notesEditMode, setNotesEditMode] =
    useState<'edit' | 'preview'>('preview')
  const [, updateState] = useState({})

  const annotationsReducer = (
    state: AnnotationInfo,
    action: {
      type: string
      allHighlights?: Highlight[]
      note?: Highlight | undefined

      updateHighlight?: Highlight | undefined
      deleteHighlightId?: string | undefined
    }
  ) => {
    switch (action.type) {
      case 'RESET': {
        const note = action.allHighlights?.find((h) => h.type == 'NOTE')
        return {
          ...state,
          loaded: true,
          note: note,
          noteId: note?.id ?? state.noteId,
          allAnnotations: [...(action.allHighlights ?? [])],
        }
      }
      case 'CREATE_NOTE': {
        if (!action.note) {
          throw new Error('No note on CREATE_NOTE action')
        }
        return {
          ...state,
          note: action.note,
          noteId: action.note.id,
          allAnnotations: [...state.allAnnotations, action.note],
        }
      }
      case 'DELETE_NOTE': {
        // If there is no note to delete, just make sure we have cleared out the note
        const noteId = action.note?.id
        if (!action.note?.id) {
          return {
            ...state,
            node: undefined,
            noteId: uuidv4(),
          }
        }
        const idx = state.allAnnotations.findIndex((h) => h.id === noteId)
        return {
          ...state,
          note: undefined,
          noteId: uuidv4(),
          allAnnotations: state.allAnnotations.splice(idx, 1),
        }
      }
      case 'DELETE_HIGHLIGHT': {
        const highlightId = action.deleteHighlightId
        console.log('  DELETE_HIGHLIGHT: ', highlightId)

        if (!highlightId) {
          throw new Error('No highlightId for delete action.')
        }
        const idx = state.allAnnotations.findIndex((h) => h.id === highlightId)
        if (idx < 0) {
          return { ...state }
        }
        const deleted = state.deletedAnnotations
        deleted.push(state.allAnnotations[idx])

        return {
          ...state,
          deletedAnnotations: deleted,
          allAnnotations: state.allAnnotations.splice(idx, 1),
        }
      }
      case 'UPDATE_HIGHLIGHT': {
        const highlight = action.updateHighlight
        if (!highlight) {
          throw new Error('No highlightId for delete action.')
        }
        const idx = state.allAnnotations.findIndex((h) => h.id === highlight.id)
        if (idx !== -1) {
          state.allAnnotations[idx] = highlight
        }
        return {
          ...state,
        }
      }
      default:
        return state
    }
  }

  const [annotations, dispatchAnnotations] = useReducer(annotationsReducer, {
    loaded: false,
    note: undefined,
    noteId: uuidv4(),
    allAnnotations: [],
    deletedAnnotations: [],
  })

  useEffect(() => {
    dispatchAnnotations({
      type: 'RESET',
      allHighlights: props.highlights,
    })
  }, [props.highlights])

  useEffect(() => {
    if (props.onAnnotationsChanged) {
      props.onAnnotationsChanged(
        annotations.allAnnotations,
        annotations.deletedAnnotations
      )
    }
  }, [annotations])

  const deleteDocumentNote = useCallback(() => {
    const note = annotations.note
    if (!note) {
      showErrorToast('No note found')
      return
    }
    ;(async () => {
      try {
        const result = await deleteHighlightMutation(note.id)
        if (!result) {
          throw new Error()
        }
        showSuccessToast('Note deleted')
        dispatchAnnotations({
          note,
          type: 'DELETE_NOTE',
        })
      } catch (err) {
        console.log('error deleting note', err)
        showErrorToast('Error deleting note')
      }
    })()
  }, [annotations])

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

    return annotations.allAnnotations
      .filter((h) => h.type === 'HIGHLIGHT')
      .sort((a: Highlight, b: Highlight) => {
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
  }, [annotations])

  const handleSaveNoteText = useCallback(
    (text, cb: (success: boolean) => void) => {
      if (!annotations.loaded) {
        // We haven't loaded the user's annotations yet, so we can't
        // find or create their highlight note.
        return
      }

      if (!annotations.note) {
        const noteId = annotations.noteId
        ;(async () => {
          const success = await createHighlightMutation({
            id: noteId,
            shortId: nanoid(8),
            type: 'NOTE',
            articleId: props.pageId,
            annotation: text,
          })
          console.log('success creating annotation note: ', success)
          if (success) {
            dispatchAnnotations({
              type: 'CREATE_NOTE',
              note: success,
            })
          }
          cb(!!success)
        })()
        return
      }

      if (annotations.note) {
        const note = annotations.note
        ;(async () => {
          const success = await updateHighlightMutation({
            highlightId: note.id,
            annotation: text,
          })
          console.log('success updating annotation note: ', success)
          if (success) {
            note.annotation = text
            dispatchAnnotations({
              type: 'UPDATE_NOTE',
              note: note,
            })
          }
          cb(!!success)
        })()
        return
      }
    },
    [annotations, props.pageId]
  )
  return (
    <VStack
      distribution="start"
      css={{ height: '100%', width: '100%', p: '20px' }}
    >
      <TitledSection
        title="ARTICLE NOTES"
        editMode={notesEditMode == 'edit'}
        setEditMode={(edit) => setNotesEditMode(edit ? 'edit' : 'preview')}
      />
      <HighlightNoteBox
        mode={notesEditMode}
        sizeMode={props.sizeMode}
        setEditMode={setNotesEditMode}
        text={annotations.note?.annotation}
        placeHolder="Add notes to this document..."
        saveText={handleSaveNoteText}
      />
      <SpanBox css={{ mt: '10px', mb: '25px' }} />
      {/* {annotations.allAnnotations.map((highlight) => (
            <Box key={`hn-${highlight.id}`} css={{ color: 'black' }}>
              {highlight.annotation}
              <Button
                onClick={() => {
                  deleteHighlightMutation(highlight.id)
                }}
              >
                DELETE
              </Button>
            </Box>
          ))} */}
      <Box css={{ width: '100%' }}>
        <TitledSection title="HIGHLIGHTS" />

        {sortedHighlights.map((highlight) => (
          <HighlightViewItem
            key={highlight.id}
            highlight={highlight}
            scrollToHighlight={props.scrollToHighlight}
            setSetLabelsTarget={setLabelsTarget}
            setShowConfirmDeleteHighlightId={setShowConfirmDeleteHighlightId}
            deleteHighlightAction={() => {
              dispatchAnnotations({
                type: 'DELETE_HIGHLIGHT',
                deleteHighlightId: highlight.id,
              })
            }}
            updateHighlight={() => {
              dispatchAnnotations({
                type: 'UPDATE_HIGHLIGHT',
                updateHighlight: highlight,
              })
            }}
          />
        ))}
        {sortedHighlights.length === 0 && (
          <Box
            css={{
              mt: '15px',
              width: '100%',
              fontSize: '9px',
              color: '$thTextSubtle',
              alignItems: 'center',
              justifyContent: 'center',
              mb: '100px',
            }}
          >
            You have not added any highlights to this document.
          </Box>
        )}
        <Box
          css={{
            '@mdDown': {
              height: '320px',
              width: '100%',
              background: 'transparent',
            },
          }}
        />
      </Box>

      {showConfirmDeleteHighlightId && (
        <ConfirmationModal
          message={'Are you sure you want to delete this highlight?'}
          onAccept={() => {
            ;(async () => {
              const success = await deleteHighlightMutation(
                showConfirmDeleteHighlightId
              )
              console.log(' ConfirmationModal::DeleteHighlight', success)
              if (success) {
                dispatchAnnotations({
                  type: 'DELETE_HIGHLIGHT',
                  deleteHighlightId: showConfirmDeleteHighlightId,
                })
                showSuccessToast('Highlight deleted.')
              } else {
                showErrorToast('Error deleting highlight')
              }
            })()
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
      {showConfirmDeleteNote && (
        <ConfirmationModal
          message="Are you sure you want to delete the note from this document?"
          acceptButtonLabel="Delete"
          onAccept={() => {
            deleteDocumentNote()
            setShowConfirmDeleteNote(false)
          }}
          onOpenChange={() => setShowConfirmDeleteNote(false)}
        />
      )}
    </VStack>
  )
}

type TitledSectionProps = {
  title: string
  editMode?: boolean
  setEditMode?: (set: boolean) => void
}

function TitledSection(props: TitledSectionProps): JSX.Element {
  return (
    <>
      <HStack
        css={{ width: '100%', borderBottom: '1px solid $thBorderColor' }}
        alignment="start"
        distribution="start"
      >
        <StyledText
          css={{
            fontFamily: '$display',
            fontStyle: 'normal',
            fontWeight: '700',
            fontSize: '12px',
            lineHeight: '20px',
            color: '#898989',
            marginBottom: '1px',
          }}
        >
          {props.title}
        </StyledText>
        {props.setEditMode && (
          <SpanBox
            css={{
              marginLeft: 'auto',
              justifyContent: 'end',
              lineHeight: '1',
              alignSelf: 'end',
              padding: '2px',
              cursor: 'pointer',
              borderRadius: '1000px',
              '&:hover': {
                background: '#EBEBEB',
              },
            }}
            onClick={(event) => {
              if (props.setEditMode) {
                props.setEditMode(!props.editMode)
              }
              event.preventDefault()
            }}
          >
            {props.editMode ? (
              <BookOpen size={15} color="#898989" />
            ) : (
              <PencilLine size={15} color="#898989" />
            )}
          </SpanBox>
        )}
      </HStack>
    </>
  )
}
