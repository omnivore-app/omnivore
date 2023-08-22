import { Box, HStack, VStack, SpanBox } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { styled, theme } from '../../tokens/stitches.config'
import type { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { updateHighlightMutation } from '../../../lib/networking/mutations/updateHighlightMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { diff_match_patch } from 'diff-match-patch'
import 'react-markdown-editor-lite/lib/index.css'
import { createHighlightMutation } from '../../../lib/networking/mutations/createHighlightMutation'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { HighlightViewItem } from '../article/HighlightViewItem'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { ReadableItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { SetHighlightLabelsModalPresenter } from '../article/SetLabelsModalPresenter'
import { ArticleNotes } from '../../patterns/ArticleNotes'
import { useGetArticleQuery } from '../../../lib/networking/queries/useGetArticleQuery'
import { formattedShortTime } from '../../../lib/dateFormatting'
import { isDarkTheme } from '../../../lib/themeUpdater'
import { Button } from '../../elements/Button'
import { ColoredStack } from '../../elements/EditLabelChipStack'

type NotebookViewProps = {
  viewer: UserBasicData

  item: ReadableItem

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

type NoteState = {
  isCreating: boolean
  note: Highlight | undefined
  createStarted: Date | undefined
}

export function NotebookView(props: NotebookViewProps): JSX.Element {
  const { articleData, mutate } = useGetArticleQuery({
    slug: props.item.slug,
    username: props.viewer.profile.username,
    includeFriendsHighlights: false,
  })
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
    []
  )

  const createNote = useCallback((text: string) => {
    noteState.current.isCreating = true
    noteState.current.createStarted = new Date()
    ;(async () => {
      try {
        const success = await createHighlightMutation({
          id: newNoteId,
          shortId: nanoid(8),
          type: 'NOTE',
          articleId: props.item.id,
          annotation: text,
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
  }, [])

  const highlights = useMemo(() => {
    const result = articleData?.article.article.highlights
    const note = result?.find((h) => h.type === 'NOTE')
    if (note) {
      noteState.current.note = note
      noteState.current.isCreating = false
      setNoteText(note.annotation || '')
    }
    return result
  }, [articleData])

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
    (text: string) => {
      const changeTime = new Date()

      setLastChanged(changeTime)
      if (noteState.current.note) {
        updateNote(noteState.current.note, text, changeTime)
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
    [noteText, noteState, createNote, updateNote, highlights]
  )

  const deleteDocumentNote = useCallback(() => {
    ;(async () => {
      highlights
        ?.filter((h) => h.type === 'NOTE')
        .forEach(async (h) => {
          const result = await deleteHighlightMutation(h.id)
          if (!result) {
            showErrorToast('Error deleting note')
          }
        })
      noteState.current.note = undefined
    })()
    setNoteText('')
  }, [noteState, highlights])

  const [errorSaving, setErrorSaving] = useState<string | undefined>(undefined)
  const [lastChanged, setLastChanged] = useState<Date | undefined>(undefined)
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined)

  useEffect(() => {
    const highlightsUpdated = () => {
      mutate()
    }
    document.addEventListener('highlightsUpdated', highlightsUpdated)
    return () => {
      document.removeEventListener('highlightsUpdated', highlightsUpdated)
    }
  }, [mutate])

  const pluralStr = (str: string, count: number | undefined) => {
    const useCount = count ?? 0
    if (count === 1) {
      return `${useCount} ${str}`
    }
    return `${useCount} ${str}s`
  }

  return (
    <VStack
      tabIndex={-1}
      distribution="start"
      css={{
        width: '100%',
        height: '100%',
        minHeight: '100%',
      }}
    >
      <StyledText
        css={{
          color: '$thTextContrast2',
          fontFamily: '$inter',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: '600',
          lineHeight: '150%',
          px: '20px',
        }}
      >
        {props.item.title}
      </StyledText>
      <HStack
        css={{
          px: '20px',
          gap: '10px',
        }}
      >
        <InfoBubble text={pluralStr('label', props.item.labels?.length)}>
          {(props.item.labels?.length ?? 0) > 0 && (
            <SpanBox css={{ ml: '14px' }}>
              <ColoredStack
                colors={props.item.labels?.map((l) => l.color) ?? []}
              />
            </SpanBox>
          )}
        </InfoBubble>
        <InfoBubble
          text={pluralStr(
            'highlight',
            props.item.highlights?.filter((h) => h.type == 'HIGHLIGHT').length
          )}
          onClick={(event) => {
            const highlights = document.getElementById('highlights-container')
            highlights?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            })
            event.preventDefault()
          }}
        />
        <InfoBubble
          text={pluralStr(
            'note',
            props.item.highlights?.filter((h) => h.type == 'NOTE').length
          )}
        />
      </HStack>
      <>
        <HStack
          alignment="start"
          distribution="start"
          css={{ width: '100%', gap: '10px', mt: '25px', px: '20px' }}
        >
          <ArticleNotes
            targetId={props.item.id}
            text={noteText}
            setText={setNoteText}
            placeHolder="Add Article Note..."
            saveText={handleSaveNoteText}
          />
        </HStack>
        <HStack
          css={{
            minHeight: '15px',
            width: '100%',
            fontSize: '9px',
            mt: '5px',
            px: '20px',
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

      <ItemSeparator></ItemSeparator>

      <VStack
        css={{ width: '100%', mt: '25px', gap: '25px', px: '25px' }}
        id="highlights-container"
      >
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
              mutate()
            }}
          />
        ))}
        {sortedHighlights.length === 0 && (
          <VStack
            alignment="center"
            distribution="center"
            css={{ width: '100%' }}
          >
            <StyledText style="emptyListMessage">
              You have not added any highlights to this document.
            </StyledText>
          </VStack>
        )}
      </VStack>

      {showConfirmDeleteHighlightId && (
        <ConfirmationModal
          message={'Are you sure you want to delete this highlight?'}
          onAccept={() => {
            ;(async () => {
              const highlightId = showConfirmDeleteHighlightId
              const success = await deleteHighlightMutation(
                showConfirmDeleteHighlightId
              )
              mutate()
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
          onOpenChange={() => {
            mutate()
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

type InfoBubbleProps = {
  text: string
  children?: React.ReactNode

  onClick?: MouseEventHandler<HTMLButtonElement>
}

const InfoBubble = (props: InfoBubbleProps): JSX.Element => {
  return (
    <Button
      style="ctaGray"
      css={{
        display: 'inline-flex',
        height: '28px',
        background: '$thBackground',
        color: '$thTextSubtle',
        fontFamily: '$inter',
        fontSize: '12px',
        fontWeight: '500',
        padding: '4px 10px',
        alignItems: 'center',
        borderRadius: '5px',
        gap: '5px',
      }}
      onClick={props.onClick}
    >
      {props.children && props.children}
      {props.text}
    </Button>
  )
}

const ItemSeparator = styled('hr', {
  width: '100%',
  border: '0.5px solid $thBorderColor',
})
