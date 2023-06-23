import { Box, HStack, VStack, SpanBox } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import {
  BookOpen,
  CaretDown,
  CaretRight,
  DotsThree,
  Pencil,
  PencilLine,
  X,
} from 'phosphor-react'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { diff_match_patch } from 'diff-match-patch'
import 'react-markdown-editor-lite/lib/index.css'
import { createHighlightMutation } from '../../../lib/networking/mutations/createHighlightMutation'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { HighlightViewItem } from './HighlightViewItem'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { TrashIcon } from '../../elements/images/TrashIcon'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { SetHighlightLabelsModalPresenter } from './SetLabelsModalPresenter'
import { Button } from '../../elements/Button'
import { ArticleNotes } from '../../patterns/ArticleNotes'
import { useGetArticleQuery } from '../../../lib/networking/queries/useGetArticleQuery'

type NotebookContentProps = {
  viewer: UserBasicData

  item: ReadableItem
  highlights: Highlight[]

  viewInReader: (highlightId: string) => void

  onAnnotationsChanged?: (highlights: Highlight[]) => void

  showConfirmDeleteNote?: boolean
  setShowConfirmDeleteNote?: (show: boolean) => void
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
  creatingNote: boolean

  allAnnotations: Highlight[]
}

export function NotebookContent(props: NotebookContentProps): JSX.Element {
  const { articleData, mutate } = useGetArticleQuery({
    slug: props.item.slug,
    username: props.viewer.profile.username,
    includeFriendsHighlights: false,
  })
  const [showConfirmDeleteHighlightId, setShowConfirmDeleteHighlightId] =
    useState<undefined | string>(undefined)
  const [labelsTarget, setLabelsTarget] = useState<Highlight | undefined>(
    undefined
  )
  const [notesEditMode, setNotesEditMode] = useState<'edit' | 'preview'>(
    'preview'
  )

  // const annotationsReducer = (
  //   state: AnnotationInfo,
  //   action: {
  //     type: string
  //     allHighlights?: Highlight[]
  //     note?: Highlight | undefined

  //     updateHighlight?: Highlight | undefined
  //     deleteHighlightId?: string | undefined
  //   }
  // ) => {
  //   switch (action.type) {
  //     case 'RESET': {
  //       const note = action.allHighlights?.find((h) => h.type == 'NOTE')
  //       return {
  //         ...state,
  //         loaded: true,
  //         note: note,
  //         noteId: note?.id ?? state.noteId,
  //         allAnnotations: [...(action.allHighlights ?? [])],
  //       }
  //     }
  //     case 'CREATE_NOTE': {
  //       if (!action.note) {
  //         throw new Error('No note on CREATE_NOTE action')
  //       }
  //       return {
  //         ...state,
  //         note: action.note,
  //         noteId: action.note.id,
  //         creatingNote: false,
  //         allAnnotations: [...state.allAnnotations, action.note],
  //       }
  //     }
  //     case 'CREATING_NOTE': {
  //       return {
  //         ...state,
  //         creatingNote: true,
  //       }
  //     }
  //     case 'DELETE_NOTE': {
  //       // If there is no note to delete, just make sure we have cleared out the note
  //       const noteId = action.note?.id
  //       if (!action.note?.id) {
  //         return {
  //           ...state,
  //           node: undefined,
  //           noteId: uuidv4(),
  //         }
  //       }
  //       const idx = state.allAnnotations.findIndex((h) => h.id === noteId)
  //       return {
  //         ...state,
  //         note: undefined,
  //         noteId: uuidv4(),
  //         allAnnotations: state.allAnnotations.splice(idx, 1),
  //       }
  //     }
  //     case 'DELETE_HIGHLIGHT': {
  //       const highlightId = action.deleteHighlightId
  //       if (!highlightId) {
  //         throw new Error('No highlightId for delete action.')
  //       }
  //       const idx = state.allAnnotations.findIndex((h) => h.id === highlightId)
  //       if (idx < 0) {
  //         return { ...state }
  //       }
  //       const deleted = state.deletedAnnotations
  //       deleted.push(state.allAnnotations[idx])

  //       return {
  //         ...state,
  //         deletedAnnotations: deleted,
  //         allAnnotations: state.allAnnotations.splice(idx, 1),
  //       }
  //     }
  //     case 'UPDATE_HIGHLIGHT': {
  //       const highlight = action.updateHighlight
  //       if (!highlight) {
  //         throw new Error('No highlightId for delete action.')
  //       }
  //       const idx = state.allAnnotations.findIndex((h) => h.id === highlight.id)
  //       if (idx !== -1) {
  //         state.allAnnotations[idx] = highlight
  //       }
  //       return {
  //         ...state,
  //       }
  //     }
  //     default:
  //       return state
  //   }
  // }

  // const [annotations, dispatchAnnotations] = useReducer(annotationsReducer, {
  //   loaded: false,
  //   note: undefined,
  //   creatingNote: false,
  //   noteId: uuidv4(),
  //   allAnnotations: [],
  //   deletedAnnotations: [],
  // })

  // useEffect(() => {
  //   dispatchAnnotations({
  //     type: 'RESET',
  //     allHighlights: props.highlights,
  //   })
  // }, [props.highlights])

  // const deleteDocumentNote = useCallback(() => {
  //   const note = annotations.note
  //   if (!note) {
  //     showErrorToast('No note found')
  //     return
  //   }
  //   ;(async () => {
  //     try {
  //       const result = await deleteHighlightMutation(note.id)
  //       if (!result) {
  //         throw new Error()
  //       }
  //       showSuccessToast('Note deleted')
  //       dispatchAnnotations({
  //         note,
  //         type: 'DELETE_NOTE',
  //       })
  //     } catch (err) {
  //       console.log('error deleting note', err)
  //       showErrorToast('Error deleting note')
  //     }
  //   })()
  // }, [annotations])

  const noteReducer = (
    state: {
      note?: Highlight
      isCreating: boolean
    },
    action: {
      type: string
      note?: Highlight
    }
  ) => {
    switch (action.type) {
      case 'SET_NOTE': {
        if (!action.note) {
          console.error(
            'invalidate SET_NOTE action, no note provider',
            action,
            state
          )
        }
        return {
          ...state,
          note: action.note,
        }
      }
    }
    return state
  }

  const [noteState, dispatchNote] = useReducer(noteReducer, {
    note: undefined,
    isCreating: false,
  })

  const highlights = useMemo(() => {
    const result = articleData?.article.article.highlights
    const note = result?.find((h) => h.type === 'NOTE')
    if (note) {
      dispatchNote({
        type: 'SET_NOTE',
        note: note,
      })
    }
    return result
  }, [articleData])

  // const note = useMemo(() => {
  //   return highlights?.find((h) => h.type === 'NOTE')
  // }, [highlights])

  useEffect(() => {
    if (highlights && props.onAnnotationsChanged) {
      props.onAnnotationsChanged(highlights)
    }
  }, [highlights])

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

    return (highlights ?? [])
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
  }, [highlights])

  const handleSaveNoteText = useCallback(
    (text, cb: (success: boolean) => void) => {},
    [highlights, props.item]
  )

  const [articleNotesCollapsed, setArticleNotesCollapsed] = useState(false)
  const [highlightsCollapsed, setHighlightsCollapsed] = useState(false)

  return (
    <VStack
      distribution="start"
      css={{
        height: '100%',
        width: '100%',
        p: '20px',
        '@mdDown': { p: '15px' },
        background: '#F8FAFB',
      }}
    >
      <SectionTitle
        title="Article Notes"
        collapsed={articleNotesCollapsed}
        setCollapsed={setArticleNotesCollapsed}
      />
      {!articleNotesCollapsed && (
        <HStack
          alignment="start"
          distribution="start"
          css={{ width: '100%', mt: '10px', gap: '10px' }}
        >
          <ArticleNotes
            mode={notesEditMode}
            targetId={props.item.id}
            setEditMode={setNotesEditMode}
            text={noteState.note?.annotation}
            placeHolder="Add notes to this document..."
            saveText={handleSaveNoteText}
          />
        </HStack>
      )}

      <SpanBox css={{ mt: '10px', mb: '25px' }} />
      <Box css={{ width: '100%' }}>
        <SectionTitle
          title="Highlights"
          collapsed={highlightsCollapsed}
          setCollapsed={setHighlightsCollapsed}
        />

        {!highlightsCollapsed && (
          <>
            {sortedHighlights.map((highlight) => (
              <HighlightViewItem
                key={highlight.id}
                item={props.item}
                viewer={props.viewer}
                highlight={highlight}
                viewInReader={props.viewInReader}
                setSetLabelsTarget={setLabelsTarget}
                setShowConfirmDeleteHighlightId={
                  setShowConfirmDeleteHighlightId
                }
                updateHighlight={() => {
                  // dispatchAnnotations({
                  //   type: 'UPDATE_HIGHLIGHT',
                  //   updateHighlight: highlight,
                  // })
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
          </>
        )}
        {/* <Box
          css={{
            '@mdDown': {
              height: '320px',
              width: '100%',
              background: 'transparent',
            },
          }}
        /> */}
      </Box>

      {showConfirmDeleteHighlightId && (
        <ConfirmationModal
          message={'Are you sure you want to delete this highlight?'}
          onAccept={() => {
            ;(async () => {
              const success = await deleteHighlightMutation(
                showConfirmDeleteHighlightId
              )
              mutate()
              if (success) {
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
        <SetHighlightLabelsModalPresenter
          highlight={labelsTarget}
          highlightId={labelsTarget.id}
          onOpenChange={() => setLabelsTarget(undefined)}
        />
      )}
      {props.showConfirmDeleteNote && (
        <ConfirmationModal
          message="Are you sure you want to delete the note from this document?"
          acceptButtonLabel="Delete"
          onAccept={() => {
            // deleteDocumentNote()
            if (props.setShowConfirmDeleteNote) {
              props.setShowConfirmDeleteNote(false)
            }
          }}
          onOpenChange={() => {
            if (props.setShowConfirmDeleteNote) {
              props.setShowConfirmDeleteNote(false)
            }
          }}
        />
      )}
    </VStack>
  )
}

type SectionTitleProps = {
  title: string
  collapsed: boolean
  setCollapsed: (set: boolean) => void
}

function SectionTitle(props: SectionTitleProps): JSX.Element {
  return (
    <>
      <Button
        style="plainIcon"
        css={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: '5px',
        }}
        onClick={(event) => {
          props.setCollapsed(!props.collapsed)
          event.stopPropagation()
        }}
      >
        {props.collapsed ? (
          <CaretRight
            size={12}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        ) : (
          <CaretDown
            size={12}
            color={theme.colors.thNotebookSubtle.toString()}
          />
        )}
        <StyledText
          css={{
            m: '0px',
            pt: '2px',
            fontFamily: '$inter',
            fontWeight: '500',
            fontSize: '12px',
            color: '$thNotebookSubtle',
          }}
        >
          {props.title}
        </StyledText>
      </Button>
    </>
  )
}
