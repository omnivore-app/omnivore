/* eslint-disable react/no-children-prop */
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { formattedShortTime } from '../../lib/dateFormatting'
import { Box, HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'

import MarkdownIt from 'markdown-it'
import MdEditor, { Plugins } from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import ReactMarkdown from 'react-markdown'
import throttle from 'lodash/throttle'
import { updateHighlightMutation } from '../../lib/networking/mutations/updateHighlightMutation'
import { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { Button } from '../elements/Button'
import remarkGfm from 'remark-gfm'
import { RcEditorStyles } from './RcEditorStyles'
import { isDarkTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'

const mdParser = new MarkdownIt()

MdEditor.use(Plugins.TabInsert, {
  tabMapValue: 1, // note that 1 means a '\t' instead of ' '.
})

type HighlightViewNoteProps = {
  targetId: string

  placeHolder: string
  mode: 'edit' | 'preview'

  highlight: Highlight

  setEditMode: (set: 'edit' | 'preview') => void

  text: string | undefined
  updateHighlight: (highlight: Highlight) => void
}

export function HighlightViewNote(props: HighlightViewNoteProps): JSX.Element {
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined)
  const [errorSaving, setErrorSaving] = useState<string | undefined>(undefined)

  const saveText = useCallback(
    (text: string, updateTime: Date, interactive: boolean) => {
      ;(async () => {
        console.log('updating highlight text')
        const success = await updateHighlightMutation({
          annotation: text,
          libraryItemId: props.targetId,
          highlightId: props.highlight?.id,
        })
        if (success) {
          setLastSaved(updateTime)
          props.highlight.annotation = text
          props.updateHighlight(props.highlight)
          if (interactive) {
            showSuccessToast('Note saved', {
              position: 'bottom-right',
            })
          }
        } else {
          setErrorSaving('Error saving note.')
        }
      })()
    },
    [props]
  )

  return (
    <MarkdownNote
      targetId={props.targetId}
      placeHolder={props.placeHolder}
      mode={props.mode}
      setEditMode={props.setEditMode}
      text={props.text}
      saveText={saveText}
      lastSaved={lastSaved}
      errorSaving={errorSaving}
      fillBackground={true}
    />
  )
}

type MarkdownNote = {
  targetId: string

  placeHolder: string
  mode: 'edit' | 'preview'

  setEditMode: (set: 'edit' | 'preview') => void

  text: string | undefined
  fillBackground: boolean | undefined

  lastSaved: Date | undefined
  errorSaving: string | undefined

  saveText: (text: string, updateTime: Date, interactive: boolean) => void
}

export function MarkdownNote(props: MarkdownNote): JSX.Element {
  const editorRef = useRef<MdEditor | null>(null)
  const isDark = isDarkTheme()
  const [lastChanged, setLastChanged] = useState<Date | undefined>(undefined)

  const saveRef = useRef(props.saveText)

  useEffect(() => {
    saveRef.current = props.saveText
  }, [props])

  const debouncedSave = useMemo<
    (text: string, updateTime: Date) => void
  >(() => {
    const func = (text: string, updateTime: Date) => {
      saveRef.current?.(text, updateTime, false)
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

      const updateTime = new Date()
      setLastChanged(updateTime)

      debouncedSave(data.text, updateTime)
    },
    []
  )

  return (
    <>
      {props.mode == 'edit' ? (
        <VStack
          css={{
            pt: '5px',
            width: '100%',
            ...RcEditorStyles(isDark, false),
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.code.toLowerCase() === 'escape') {
              props.setEditMode('preview')
              event.preventDefault()
              event.stopPropagation()
            }
          }}
        >
          <MdEditor
            key="note-editor"
            ref={editorRef}
            autoFocus={true}
            defaultValue={props.text}
            placeholder={props.placeHolder}
            view={{ menu: true, md: true, html: false }}
            canView={{
              menu: props.mode == 'edit',
              md: true,
              html: true,
              both: false,
              fullScreen: false,
              hideMenu: false,
            }}
            plugins={[
              'tab-insert',
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
            ]}
            style={{
              width: '100%',
              height: '160px',
            }}
            renderHTML={(text: string) => mdParser.render(text)}
            onChange={handleEditorChange}
          />
          <HStack
            css={{
              minHeight: '15px',
              width: '100%',
              fontSize: '9px',
              mt: '1px',
              color: '$thTextSubtle',
            }}
            alignment="start"
            distribution="start"
          >
            {props.errorSaving && (
              <SpanBox
                css={{
                  width: '100%',
                  fontSize: '9px',
                  mt: '1px',
                  color: 'red',
                }}
              >
                {props.errorSaving}
              </SpanBox>
            )}
            {props.lastSaved !== undefined ? (
              <>
                {lastChanged === props.lastSaved
                  ? 'Saved'
                  : `Last saved ${formattedShortTime(
                      props.lastSaved.toISOString()
                    )}`}
              </>
            ) : null}
            <SpanBox
              css={{
                fontSize: '9px',
                mt: '10px',
                color: 'green',
                marginLeft: 'auto',
              }}
            >
              <Button
                css={{ marginRight: '10px' }}
                style="ctaOutlineYellow"
                onClick={(event) => {
                  props.setEditMode('preview')
                  event.preventDefault()
                }}
              >
                Cancel
              </Button>
              <Button
                style="ctaDarkYellow"
                onClick={(event) => {
                  if (editorRef.current) {
                    const value = editorRef.current.getMdValue()
                    const updateTime = new Date()
                    setLastChanged(updateTime)
                    props.saveText(value, updateTime, true)
                    props.setEditMode('preview')
                  } else {
                    showErrorToast('Error saving note.', {
                      position: 'bottom-right',
                    })
                  }
                  event.preventDefault()
                }}
              >
                Save
              </Button>
            </SpanBox>
          </HStack>
        </VStack>
      ) : (
        <>
          <SpanBox
            css={{
              p: props.text ? '10px' : '0px',
              width: '100%',
              fontSize: '12px',
              marginTop: '0px',
              color: props.text ? '$thHighContrast' : '#898989',
              borderRadius: '5px',
              background:
                props.text && props.fillBackground
                  ? '$thNotebookTextBackground'
                  : 'unset',
              '> *': {
                m: '0px',
              },
            }}
            onClick={() => props.setEditMode('edit')}
          >
            <ReactMarkdown
              children={props.text ?? props.placeHolder}
              remarkPlugins={[remarkGfm]}
            />
          </SpanBox>
        </>
      )}
    </>
  )
}
