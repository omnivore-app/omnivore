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
import {
  ChangeEvent,
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
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
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import ReactMarkdown from 'react-markdown'
import { formattedShortTime } from '../../../lib/dateFormatting'
import { createHighlightMutation } from '../../../lib/networking/mutations/createHighlightMutation'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import throttle from 'lodash/throttle'
import { deleteHighlightMutation } from '../../../lib/networking/mutations/deleteHighlightMutation'
import { LibraryItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { HighlightNoteBox } from '../HighlightNoteBox'

const mdParser = new MarkdownIt()

type NotebookModalProps = {
  pageId: string
  highlights: Highlight[]
  scrollToHighlight?: (arg: string) => void
  updateHighlight: (highlight: Highlight) => void
  deleteHighlightAction?: (highlightId: string) => void
  onOpenChange: (open: boolean) => void
}

type HighlightListReducerAction = {
  type: string
  itemId?: string
  createId?: string
  removeId?: string
  highlight?: Highlight
  highlights?: Highlight[]
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
  const [sizeMode, setSizeMode] = useState<'normal' | 'maximized'>('normal')
  const [showConfirmDeleteNote, setShowConfirmDeleteNote] = useState(false)
  const [notesEditMode, setNotesEditMode] = useState<'edit' | 'preview'>('edit')
  const [, updateState] = useState({})

  const listReducer = (
    state: Highlight[],
    action: HighlightListReducerAction
  ) => {
    switch (action.type) {
      case 'RESET':
        return action.highlights ?? []
      case 'CREATE_NOTE':
        if (!action.highlight) {
          throw new Error('Unable to create note')
        }
        return [...(action.highlights ?? []), action.highlight]
      case 'UPDATE_NOTE':
        return action.highlights ?? []
      case 'REMOVE_HIGHLIGHT':
      // const item = state.find((li) => li.node.id === action.itemId)
      // if (item && item.node.highlights) {
      //   item.node.highlights = item.node.highlights.filter(
      //     (h) => h.id !== action.highlightId
      //   )
      // }
      // const result = state.filter(
      //   (item) => item.node.highlights && item.node.highlights.length > 0
      // )
      // return result
      default:
        throw new Error()
    }
  }

  const [highlights, dispatchList] = useReducer(listReducer, [])

  useEffect(() => {
    dispatchList({
      type: 'RESET',
      highlights: props.highlights,
    })
  }, [props.highlights])

  const exportHighlights = useCallback(() => {
    ;(async () => {
      if (!highlights) {
        showErrorToast('No highlights to export')
        return
      }
      const markdown = highlightsAsMarkdown(highlights)
      await navigator.clipboard.writeText(markdown)
      showSuccessToast('Highlight copied')
    })()
  }, [highlights])

  const deleteDocumentNote = useCallback(() => {
    ;(async () => {
      const notes = highlights.filter((h) => h.type == 'NOTE')

      notes.forEach(async (n) => {
        try {
          const result = await deleteHighlightMutation(n.id)
          if (!result) {
            throw new Error()
          }
          showSuccessToast('Note deleted')
        } catch (err) {
          console.log('error deleting note', err)
          showErrorToast('Error deleting note')
        }
      })
    })()
  }, [])

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

    return highlights
      .filter((h) => h.type === undefined || h.type === 'HIGHLIGHT')
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

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
          props.onOpenChange(false)
        }}
        css={{
          overflow: 'auto',
          height: sizeMode === 'normal' ? 'unset' : '100%',
          maxWidth: sizeMode === 'normal' ? '640px' : '100%',
          minHeight: '525px',
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
            bg: '$thBackground',
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
            <CloseButton close={() => props.onOpenChange(false)} />
          </HStack>
        </HStack>
        <VStack distribution="start" css={{ height: '100%', p: '20px' }}>
          <TitledSection
            title="ARTICLE NOTES"
            editMode={notesEditMode == 'edit'}
            setEditMode={(edit) => setNotesEditMode(edit ? 'edit' : 'preview')}
          />
          <HighlightNoteBox
            pageId={props.pageId}
            placeHolder="Add notes to this document..."
            highlight={highlights.find((h) => h.type == 'NOTE')}
            sizeMode={sizeMode}
            mode={notesEditMode}
            setEditMode={setNotesEditMode}
            // dispatchList={dispatchList}
          />
          <SpanBox css={{ mt: '10px', mb: '25px' }} />
          {/* {props.highlights.map((highlight) => (
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
      {showConfirmDeleteNote && (
        <ConfirmationModal
          message="Are you sure you want to delete the note from this document?"
          acceptButtonLabel="Delete"
          onAccept={() => deleteDocumentNote()}
          onOpenChange={() => setShowConfirmDeleteNote(false)}
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
  const [hover, setHover] = useState(false)

  return (
    <HStack
      css={{ width: '100%', py: '20px', cursor: 'pointer' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <VStack css={{ width: '100%' }}>
        <HighlightView
          scrollToHighlight={props.scrollToHighlight}
          highlight={props.highlight}
        />

        <SpanBox css={{ mb: '15px' }} />
      </VStack>
      <SpanBox
        css={{
          marginLeft: 'auto',
          width: '20px',
          visibility: hover ? 'unset' : 'hidden',
          '@media (hover: none)': {
            visibility: 'unset',
          },
        }}
      >
        <HighlightsMenu
          highlight={props.highlight}
          setLabelsTarget={props.setSetLabelsTarget}
          setShowConfirmDeleteHighlightId={
            props.setShowConfirmDeleteHighlightId
          }
        />
      </SpanBox>
    </HStack>
  )
}

type NoteSectionProps = {
  pageId: string
  highlight?: Highlight

  sizeMode: 'normal' | 'maximized'
  mode: 'edit' | 'read'
  setEditMode: (set: boolean) => void

  dispatchList: Dispatch<HighlightListReducerAction>
}

function NoteSection(props: NoteSectionProps): JSX.Element {
  const [noteText, setNoteText] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined)
  const [lastChanged, setLastChanged] = useState<Date | undefined>(undefined)
  const [errorSaving, setErrorSaving] = useState<string | undefined>(undefined)

  const [createStartTime, setCreateStartTime] = useState<Date | undefined>(
    undefined
  )

  useEffect(() => {
    setNoteText(props.highlight?.annotation ?? '')
  }, [props.highlight?.annotation])

  const highlightId = useMemo(() => {
    console.log(' -- highlightId: ', props.highlight)
    if (props.highlight) {
      return { id: props.highlight.id, shortId: props.highlight.shortId }
    }
    return { id: uuidv4(), shortId: nanoid(8) }
  }, [props.highlight])

  const saveText = useCallback(
    (text, updateTime) => {
      ;(async () => {
        console.log('calling save: ', props.highlight)
        if (props.highlight) {
          const success = await updateHighlightMutation({
            annotation: text,
            highlightId: props.highlight?.id,
          })
          if (success) {
            setLastSaved(updateTime)
          } else {
            setErrorSaving('Error saving highlight.')
          }
        } else {
          console.log('creating note highlight: ', highlightId)
          if (!createStartTime) {
            setCreateStartTime(new Date())

            const created = await createHighlightMutation({
              type: 'NOTE',
              id: highlightId.id,
              articleId: props.pageId,
              shortId: highlightId.shortId,
              annotation: text,
            })
            console.log('created highlight: ', created)

            if (created) {
              setLastSaved(updateTime)
              props.dispatchList({
                type: 'CREATE_NOTE',
                highlight: created,
              })
            } else {
              console.log('unable to create note highlight')
            }
          }
        }
      })()
    },
    [lastSaved, lastChanged, createStartTime]
  )

  const saveRef = useRef(saveText)

  useEffect(() => {
    saveRef.current = saveText
  }, [lastSaved, lastChanged, createStartTime])

  const debouncedSave = useMemo<
    (text: string, updateTime: Date) => void
  >(() => {
    const func = (text: string, updateTime: Date) => {
      saveRef.current?.(text, updateTime)
    }
    return throttle(func, 3000)
  }, [])

  const handleEditorChange = useCallback(
    (
      data: { text: string; html: string },
      event?: ChangeEvent<HTMLTextAreaElement> | undefined
    ) => {
      if (event) {
        event.preventDefault()
      }

      setNoteText(data.text)

      const updateTime = new Date()
      setLastChanged(updateTime)
      debouncedSave(data.text, updateTime)
    },
    [lastSaved, lastChanged, createStartTime]
  )

  return (
    <>
      {props.mode == 'edit' ? (
        <VStack
          css={{
            width: '100%',
            mt: '15px',
            '.rc-md-editor': {
              borderRadius: '5px',
            },
            '.rc-md-navigation visible': {
              borderRadius: '5px',
            },
          }}
        >
          <MdEditor
            placeholder="Add notes..."
            value={noteText}
            view={{ menu: true, md: true, html: false }}
            canView={{
              menu: true,
              md: true,
              html: true,
              both: false,
              fullScreen: false,
              hideMenu: false,
            }}
            plugins={[
              'header',
              'font-bold',
              'font-italic',
              'font-underline',
              'font-strikethrough',
              'list-unordered',
              'list-ordered',
              'block-quote',
              'link',
              'auto-resize',
              'mode-toggle',
            ]}
            style={{
              width: '100%',
              height: props.sizeMode == 'normal' ? '160px' : '320px',
            }}
            renderHTML={(text: string) => mdParser.render(text)}
            onChange={handleEditorChange}
          />
          <Box
            css={{
              minHeight: '15px',
              width: '100%',
              fontSize: '9px',
              mt: '1px',
              color: '$thTextSubtle',
            }}
          >
            {errorSaving && (
              <SpanBox
                css={{
                  width: '100%',
                  fontSize: '9px',
                  mt: '1px',
                  color: 'red',
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
          </Box>
        </VStack>
      ) : (
        <>
          {props.highlight?.annotation ? (
            <Box
              css={{
                borderRadius: '5px',
                width: '100%',
                color: '#3D3D3D',
                fontSize: '16px',
                minHeight: props.sizeMode == 'normal' ? '191px' : '351px',
              }}
            >
              <ReactMarkdown children={props.highlight?.annotation} />
            </Box>
          ) : (
            <Box
              css={{
                mt: '15px',
                width: '100%',
                height: props.sizeMode == 'normal' ? '160px' : '320px',
                fontSize: '9px',
                color: '$thTextSubtle',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              No note on this document, enter edit mode by clicking the pencil
              icon above to add a note.
            </Box>
          )}
        </>
      )}
    </>
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
      <HStack css={{ width: '100%' }} alignment="start" distribution="start">
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
      <Box css={{ width: '100%', height: '1px', bg: '#EBEBEB', mb: '10px' }} />
    </>
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
