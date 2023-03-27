import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
} from '../../elements/ModalPrimitives'
import { Box, HStack, VStack, SpanBox } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { TrashIcon } from '../../elements/images/TrashIcon'
import { theme } from '../../tokens/stitches.config'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../../patterns/HighlightView'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { ArrowsIn, ArrowsOut, BookOpen, PencilLine, X } from 'phosphor-react'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { SetLabelsModal } from './SetLabelsModal'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { setLabelsForHighlight } from '../../../lib/networking/mutations/setLabelsForHighlight'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { diff_match_patch } from 'diff-match-patch'
import { MenuTrigger } from '../../elements/MenuTrigger'
import { highlightsAsMarkdown, HighlightsMenu } from '../homeFeed/HighlightItem'
import 'react-markdown-editor-lite/lib/index.css'
import { createHighlightMutation } from '../../../lib/networking/mutations/createHighlightMutation'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { HighlightNoteBox } from '../../patterns/HighlightNotes'
import { HighlightViewItem } from './HighlightViewItem'
import { Notebook } from './Notebook'

type NotebookModalProps = {
  pageId: string
  highlights: Highlight[]
  scrollToHighlight?: (arg: string) => void
  onClose: (highlights: Highlight[], deletedAnnotations: Highlight[]) => void
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

export function NotebookModal(props: NotebookModalProps): JSX.Element {
  const [showConfirmDeleteHighlightId, setShowConfirmDeleteHighlightId] =
    useState<undefined | string>(undefined)
  const [labelsTarget, setLabelsTarget] = useState<Highlight | undefined>(
    undefined
  )
  const [sizeMode, setSizeMode] = useState<'normal' | 'maximized'>('normal')
  const [showConfirmDeleteNote, setShowConfirmDeleteNote] = useState(false)
  const [notesEditMode, setNotesEditMode] = useState<'edit' | 'preview'>(
    'preview'
  )

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
        console.log(' -- reseting highlights: ', action.allHighlights)
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

  const exportHighlights = useCallback(() => {
    ;(async () => {
      if (!annotations) {
        showErrorToast('No highlights to export')
        return
      }
      const markdown = highlightsAsMarkdown(annotations.allAnnotations)
      await navigator.clipboard.writeText(markdown)
      showSuccessToast('Highlight copied')
    })()
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

  const handleClose = useCallback(() => {
    props.onClose(annotations.allAnnotations, annotations.deletedAnnotations)
  }, [annotations])

  return (
    <ModalRoot defaultOpen onOpenChange={handleClose}>
      <ModalOverlay />
      <ModalContent
        onInteractOutside={(event) => {
          event.preventDefault()
        }}
        css={{
          overflow: 'auto',
          height: sizeMode === 'normal' ? 'unset' : '100%',
          maxWidth: sizeMode === 'normal' ? '640px' : '100%',
          minHeight: sizeMode === 'normal' ? '525px' : 'unset',
        }}
      >
        <HStack
          distribution="between"
          alignment="center"
          css={{
            width: '100%',
            position: 'sticky',
            top: '0px',
            height: '50px',
            p: '20px',
            bg: '$grayBg',
            zIndex: 10,
          }}
        >
          <StyledText style="modalHeadline" css={{ color: '$thTextSubtle2' }}>
            Notebook
          </StyledText>
          <HStack
            css={{
              ml: 'auto',
              cursor: 'pointer',
              gap: '5px',
              mr: '-5px',
            }}
            distribution="center"
            alignment="center"
          >
            <SizeToggle mode={sizeMode} setMode={setSizeMode} />
            <Dropdown triggerElement={<MenuTrigger />}>
              <DropdownOption
                onSelect={() => {
                  exportHighlights()
                }}
                title="Export Notebook"
              />
              <DropdownOption
                onSelect={() => {
                  setShowConfirmDeleteNote(true)
                }}
                title="Delete Document Note"
              />
            </Dropdown>
            <CloseButton close={handleClose} />
          </HStack>
        </HStack>
        <Notebook {...props} />
      </ModalContent>
    </ModalRoot>
  )
}

type SizeToggleProps = {
  mode: 'normal' | 'maximized'
  setMode: (mode: 'normal' | 'maximized') => void
}

function CloseButton(props: { close: () => void }): JSX.Element {
  return (
    <Button
      style="plainIcon"
      css={{
        display: 'flex',
        padding: '3px',
        alignItems: 'center',
        borderRadius: '9999px',
        '&:hover': {
          bg: '#898989',
        },
        '@mdDown': {
          display: 'none',
        },
      }}
      onClick={(event) => {
        props.close()
        event.preventDefault()
      }}
    >
      <X
        width={17}
        height={17}
        color={theme.colors.thTextContrast2.toString()}
      />
    </Button>
  )
}
function SizeToggle(props: SizeToggleProps): JSX.Element {
  return (
    <Button
      style="plainIcon"
      css={{
        display: 'flex',
        padding: '2px',
        alignItems: 'center',
        borderRadius: '9999px',
        '&:hover': {
          bg: '#898989',
        },
        '@mdDown': {
          display: 'none',
        },
      }}
      onClick={(event) => {
        props.setMode(props.mode == 'normal' ? 'maximized' : 'normal')
        event.preventDefault()
      }}
    >
      {props.mode == 'normal' ? (
        <ArrowsOut size="15" color={theme.colors.thTextContrast2.toString()} />
      ) : (
        <ArrowsIn size="15" color={theme.colors.thTextContrast2.toString()} />
      )}
    </Button>
  )
}
