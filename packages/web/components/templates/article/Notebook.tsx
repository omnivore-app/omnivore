import { nanoid } from 'nanoid'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import 'react-markdown-editor-lite/lib/index.css'
import { v4 as uuidv4 } from 'uuid'
import { formattedShortTime } from '../../../lib/dateFormatting'
import { sortHighlights } from '../../../lib/highlights/sortHighlights'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import {
  useCreateHighlight,
  useDeleteHighlight,
  useUpdateHighlight,
} from '../../../lib/networking/highlights/useItemHighlights'
import {
  ReadableItem,
  useGetLibraryItemContent,
} from '../../../lib/networking/library_items/useLibraryItems'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { isDarkTheme } from '../../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { ArticleNotes } from '../../patterns/ArticleNotes'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { theme } from '../../tokens/stitches.config'
import { HighlightViewItem } from './HighlightViewItem'
import { SetHighlightLabelsModalPresenter } from './SetLabelsModalPresenter'

type NotebookContentProps = {
  viewer: UserBasicData

  item: ReadableItem

  viewInReader: (highlightId: string) => void

  onAnnotationsChanged?: (highlights: Highlight[]) => void

  showConfirmDeleteNote?: boolean
  setShowConfirmDeleteNote?: (show: boolean) => void
}

type NoteState = {
  isCreating: boolean
  note: Highlight | undefined
  createStarted: Date | undefined
}

export function NotebookContent(props: NotebookContentProps): JSX.Element {
  const isDark = isDarkTheme()
  const createHighlight = useCreateHighlight()
  const deleteHighlight = useDeleteHighlight()
  const updateHighlight = useUpdateHighlight()

  const { data: article } = useGetLibraryItemContent(
    props.viewer.profile.username as string,
    props.item.slug as string
  )
  const [noteText, setNoteText] = useState<string>('')
  const [showConfirmDeleteHighlightId, setShowConfirmDeleteHighlightId] =
    useState<undefined | string>(undefined)
  const [labelsTarget, setLabelsTarget] = useState<Highlight | undefined>(
    undefined
  )
  const noteState = useRef<NoteState>({
    isCreating: false,
    note: undefined,
    createStarted: undefined,
  })

  const newNoteId = useMemo(() => {
    return uuidv4()
  }, [])

  const updateNote = useCallback(
    (note: Highlight, text: string, startTime: Date) => {
      ;(async () => {
        const result = await updateHighlightMutation({
          libraryItemId: props.item.id,
          highlightId: note.id,
          annotation: text,
        })
        if (result) {
          setLastSaved(startTime)
        } else {
          setErrorSaving('Error saving')
        }
      })()
    },
    [props]
  )

  const deleteNote = useCallback(
    (noteId: string) => {
      ;(async () => {
        const result = await deleteHighlight.mutateAsync({
          itemId: props.item.id,
          slug: props.item.slug,
          highlightId: noteId,
        })
        if (result) {
          noteState.current.note = undefined
          setNoteText('')
        } else {
          setErrorSaving('Error deleting note')
        }
      })()
    },
    [props, deleteHighlight]
  )

  const createNote = useCallback(
    (text: string) => {
      noteState.current.isCreating = true
      noteState.current.createStarted = new Date()
      ;(async () => {
        try {
          const success = await createHighlight.mutateAsync({
            itemId: props.item.id,
            slug: props.item.slug,
            input: {
              id: newNoteId,
              shortId: nanoid(8),
              type: 'NOTE',
              articleId: props.item.id,
              annotation: text,
            },
          })
          if (success) {
            noteState.current.note = success
            noteState.current.isCreating = false
          } else {
            setErrorSaving('Error creating note')
          }
        } catch (error) {
          console.error('error creating note: ', error)
          noteState.current.isCreating = false
          setErrorSaving('Error creating note')
        }
      })()
    },
    [props, newNoteId]
  )

  const highlights = useMemo(() => {
    const result = article?.highlights
    const note = result?.find((h) => h.type === 'NOTE')
    if (note) {
      noteState.current.note = note
      noteState.current.isCreating = false
      setNoteText(note.annotation || '')
    } else {
      setNoteText('')
    }
    return result
  }, [article])

  useEffect(() => {
    if (highlights && props.onAnnotationsChanged) {
      props.onAnnotationsChanged(highlights)
    }
  }, [props, highlights])

  const sortedHighlights = useMemo(() => {
    return sortHighlights(highlights ?? [])
  }, [highlights])

  const handleSaveNoteText = useCallback(
    (text: string) => {
      const changeTime = new Date()

      setLastChanged(changeTime)
      if (noteState.current.note) {
        if (noteState.current.note.type === 'NOTE' && text === '') {
          deleteNote(noteState.current.note.id)
          return
        }

        updateNote(noteState.current.note, text, changeTime)
        return
      }

      if (text === '') {
        return
      }

      if (noteState.current.isCreating) {
        if (noteState.current.createStarted) {
          const timeSinceStart =
            new Date().getTime() - noteState.current.createStarted.getTime()

          if (timeSinceStart > 4000) {
            createNote(text)
            return
          }
        }
        return
      }

      createNote(text)
    },
    [createNote, updateNote, deleteNote]
  )

  const deleteDocumentNote = useCallback(() => {
    ;(async () => {
      highlights
        ?.filter((h) => h.type === 'NOTE')
        .forEach(async (h) => {
          const result = await deleteHighlight.mutateAsync({
            itemId: props.item.id,
            slug: props.item.slug,
            highlightId: h.id,
          })
          if (!result) {
            showErrorToast('Error deleting note')
          }
        })
      noteState.current.note = undefined
    })()
    setNoteText('')
  }, [props, noteState, highlights])

  const [errorSaving, setErrorSaving] = useState<string | undefined>(undefined)
  const [lastChanged, setLastChanged] = useState<Date | undefined>(undefined)
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined)

  return (
    <VStack
      tabIndex={-1}
      distribution="start"
      css={{
        height: '100%',
        width: '100%',
        px: '20px',
        '@mdDown': { p: '15px' },
      }}
    >
      <>
        <HStack
          alignment="start"
          distribution="start"
          css={{ width: '100%', gap: '10px', mt: '25px' }}
        >
          <ArticleNotes
            targetId={props.item.id}
            text={noteText}
            setText={setNoteText}
            placeHolder="Add notes to this document..."
            saveText={handleSaveNoteText}
          />
        </HStack>
        <HStack
          css={{
            minHeight: '15px',
            width: '100%',
            fontSize: '9px',
            mt: '5px',
            color: '$thTextSubtle',
          }}
          alignment="start"
          distribution="start"
        >
          {errorSaving && (
            <SpanBox
              css={{
                width: '100%',
                fontSize: '9px',
                mt: '5px',
              }}
            >
              {errorSaving}
            </SpanBox>
          )}
          {lastSaved !== undefined ? (
            <>
              {lastChanged === lastSaved
                ? 'Saved'
                : `Last saved ${formattedShortTime(lastSaved.toISOString())}`}
            </>
          ) : null}
        </HStack>
      </>

      <VStack css={{ mt: '25px', gap: '25px' }}>
        {sortedHighlights.map((highlight) => (
          <HighlightViewItem
            key={highlight.id}
            item={props.item}
            viewer={props.viewer}
            highlight={highlight}
            viewInReader={props.viewInReader}
            setSetLabelsTarget={setLabelsTarget}
            setShowConfirmDeleteHighlightId={setShowConfirmDeleteHighlightId}
            updateHighlight={() => {
              // nothing should be needed here anymore with new caching
              console.log('update highlight')
            }}
          />
        ))}
        {sortedHighlights.length === 0 && (
          <Box
            css={{
              p: '10px',
              mt: '15px',
              width: '100%',
              fontSize: '13px',
              color: '$thTextSubtle',
              alignItems: 'center',
              justifyContent: 'center',
              mb: '100px',
              bg: isDark ? '#3D3D3D' : '$thBackground',
              borderRadius: '6px',
              boxShadow: '0px 4px 4px rgba(33, 33, 33, 0.1)',
            }}
          >
            You have not added any highlights to this document.
          </Box>
        )}
        <Box
          css={{
            width: '100%',
            height: '320px',
          }}
        ></Box>
      </VStack>

      {showConfirmDeleteHighlightId && (
        <ConfirmationModal
          message={'Are you sure you want to delete this highlight?'}
          onAccept={() => {
            ;(async () => {
              const highlightId = showConfirmDeleteHighlightId
              const success = await deleteHighlight.mutateAsync({
                itemId: props.item.id,
                slug: props.item.slug,
                highlightId: showConfirmDeleteHighlightId,
              })
              if (success) {
                showSuccessToast('Highlight deleted.', {
                  position: 'bottom-right',
                })
                const event = new CustomEvent('deleteHighlightbyId', {
                  detail: highlightId,
                })
                document.dispatchEvent(event)
              } else {
                showErrorToast('Error deleting highlight', {
                  position: 'bottom-right',
                })
              }
            })()
            setShowConfirmDeleteHighlightId(undefined)
          }}
          onOpenChange={() => setShowConfirmDeleteHighlightId(undefined)}
          icon={
            <TrashIcon
              size={40}
              color={theme.colors.grayTextContrast.toString()}
            />
          }
        />
      )}
      {labelsTarget && (
        <SetHighlightLabelsModalPresenter
          highlight={labelsTarget}
          highlightId={labelsTarget.id}
          onUpdate={(highlight) => {
            // Don't actually need to do something here
            console.log('update highlight: ', highlight)
          }}
          onOpenChange={() => {
            setLabelsTarget(undefined)
          }}
        />
      )}
      {props.showConfirmDeleteNote && (
        <ConfirmationModal
          message="Are you sure you want to delete the note from this document?"
          acceptButtonLabel="Delete"
          onAccept={() => {
            deleteDocumentNote()
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
