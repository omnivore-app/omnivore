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
import { HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'

import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import ReactMarkdown from 'react-markdown'
import throttle from 'lodash/throttle'
import { updateHighlightMutation } from '../../lib/networking/mutations/updateHighlightMutation'
import { Highlight } from '../../lib/networking/fragments/highlightFragment'

const mdParser = new MarkdownIt()

type NoteSectionProps = {
  placeHolder: string
  mode: 'edit' | 'preview'

  sizeMode: 'normal' | 'maximized'
  setEditMode: (set: 'edit' | 'preview') => void

  text: string | undefined
  saveText: (text: string, completed: (success: boolean) => void) => void
}

export function HighlightNoteBox(props: NoteSectionProps): JSX.Element {
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined)

  const saveText = useCallback(
    (text, updateTime) => {
      props.saveText(text, (success) => {
        if (success) {
          setLastSaved(updateTime)
        }
      })
    },
    [props]
  )

  return (
    <MarkdownNote
      placeHolder={props.placeHolder}
      mode={props.mode}
      sizeMode={props.sizeMode}
      setEditMode={props.setEditMode}
      text={props.text}
      saveText={saveText}
      lastSaved={lastSaved}
    />
  )
}

type HighlightViewNoteProps = {
  placeHolder: string
  mode: 'edit' | 'preview'

  highlight: Highlight

  sizeMode: 'normal' | 'maximized'
  setEditMode: (set: 'edit' | 'preview') => void

  text: string | undefined
  updateHighlight: (highlight: Highlight) => void
}

export function HighlightViewNote(props: HighlightViewNoteProps): JSX.Element {
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined)

  const saveText = useCallback(
    (text, updateTime) => {
      ;(async () => {
        const success = await updateHighlightMutation({
          annotation: text,
          highlightId: props.highlight?.id,
        })
        if (success) {
          setLastSaved(updateTime)
          props.highlight.annotation = text
          props.updateHighlight(props.highlight)
        }
      })()
    },
    [props]
  )

  return (
    <MarkdownNote
      placeHolder={props.placeHolder}
      mode={props.mode}
      sizeMode={props.sizeMode}
      setEditMode={props.setEditMode}
      text={props.text}
      saveText={saveText}
      lastSaved={lastSaved}
    />
  )
}

type MarkdownNote = {
  placeHolder: string
  mode: 'edit' | 'preview'

  sizeMode: 'normal' | 'maximized'
  setEditMode: (set: 'edit' | 'preview') => void

  text: string | undefined

  lastSaved: Date | undefined
  saveText: (text: string, updateTime: Date) => void
}

export function MarkdownNote(props: MarkdownNote): JSX.Element {
  const [lastChanged, setLastChanged] = useState<Date | undefined>(undefined)
  const [errorSaving, setErrorSaving] = useState<string | undefined>(undefined)

  const saveRef = useRef(props.saveText)

  useEffect(() => {
    saveRef.current = props.saveText
  }, [props.lastSaved, lastChanged])

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

      const updateTime = new Date()
      setLastChanged(updateTime)
      debouncedSave(data.text, updateTime)
    },
    [props.lastSaved, lastChanged]
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
            '.rc-md-navigation': {
              borderRadius: '5px',
              borderBottomLeftRadius: '0px',
              borderBottomRightRadius: '0px',
            },
            '.rc-md-editor .editor-container >.section': {
              borderRight: 'unset',
            },
            '.rc-md-editor .editor-container .sec-md .input': {
              padding: '10px',
              borderRadius: '5px',
            },
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.code.toLowerCase() === 'escape') {
              props.setEditMode('preview')
              event.preventDefault()
            }
          }}
        >
          <MdEditor
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
              height: props.sizeMode == 'normal' ? '160px' : '320px',
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
            {props.lastSaved !== undefined ? (
              <>
                {lastChanged === props.lastSaved
                  ? 'Saved'
                  : `Last saved ${formattedShortTime(
                      props.lastSaved.toISOString()
                    )}`}
              </>
            ) : null}
          </HStack>
        </VStack>
      ) : (
        <>
          <SpanBox
            css={{
              borderRadius: '5px',
              p: '10px',
              width: '100%',
              marginTop: '15px',
              color: '$thHighContrast',
              bg: '#F5F5F5',
              '> *': {
                m: '0px',
              },
            }}
            onClick={() => props.setEditMode('edit')}
          >
            <ReactMarkdown children={props.text ?? props.placeHolder} />
          </SpanBox>
        </>
      )}
    </>
  )
}
