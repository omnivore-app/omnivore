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
import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../elements/ModalPrimitives'
import { CloseButton } from '../elements/CloseButton'
import { StyledText } from '../elements/StyledText'
import remarkGfm from 'remark-gfm'
import MDEditorSavePlugin from './MDEditorSavePlugin'
import HandleFullScreen from './MDEditorSavePlugin'
import Counter from './MDEditorSavePlugin'
import { isDarkTheme } from '../../lib/themeUpdater'
import { RcEditorStyles } from './RcEditorStyles'

const mdParser = new MarkdownIt()

MdEditor.use(Plugins.TabInsert, {
  tabMapValue: 1, // note that 1 means a '\t' instead of ' '.
})

console.log()
MdEditor.use(Counter)

type NoteSectionProps = {
  targetId: string

  placeHolder: string

  text: string
  setText: (text: string) => void

  saveText: (text: string) => void
}

export function ArticleNotes(props: NoteSectionProps): JSX.Element {
  const saveText = useCallback(
    (text) => {
      props.saveText(text)
    },
    [props]
  )

  return (
    <MarkdownNote
      targetId={props.targetId}
      placeHolder={props.placeHolder}
      text={props.text}
      setText={props.setText}
      saveText={saveText}
      fillBackground={false}
    />
  )
}

type HighlightViewNoteProps = {
  targetId: string

  placeHolder: string
  mode: 'edit' | 'preview'

  highlight: Highlight

  setEditMode: (set: 'edit' | 'preview') => void

  text: string
  setText: (text: string) => void

  updateHighlight: (highlight: Highlight) => void
}

export function HighlightViewNote(props: HighlightViewNoteProps): JSX.Element {
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined)

  const saveText = useCallback(
    (text) => {
      ;(async () => {
        const success = await updateHighlightMutation({
          annotation: text,
          highlightId: props.highlight?.id,
        })
        if (success) {
          // setLastSaved(updateTime)
          props.highlight.annotation = text
          props.updateHighlight(props.highlight)
        }
      })()
    },
    [props]
  )

  return (
    <MarkdownNote
      targetId={props.targetId}
      placeHolder={props.placeHolder}
      text={props.text}
      setText={props.setText}
      saveText={saveText}
      fillBackground={true}
    />
  )
}

type MarkdownNote = {
  targetId: string

  placeHolder: string

  text: string | undefined
  setText: (text: string) => void
  fillBackground: boolean | undefined

  saveText: (text: string) => void
}

export function MarkdownNote(props: MarkdownNote): JSX.Element {
  const editorRef = useRef<MdEditor | null>(null)
  const isDark = isDarkTheme()

  const saveRef = useRef(props.saveText)

  useEffect(() => {
    saveRef.current = props.saveText
  }, [props])

  const debouncedSave = useMemo<(text: string) => void>(() => {
    const func = (text: string) => {
      saveRef.current?.(text)
    }
    return throttle(func, 3000)
  }, [])

  const handleEditorChange = useCallback(
    (
      data: { text: string; html: string },
      event?: ChangeEvent<HTMLTextAreaElement> | undefined
    ) => {
      props.setText(data.text)
      if (event) {
        event.preventDefault()
      }

      debouncedSave(data.text)
    },
    []
  )

  useEffect(() => {
    const saveMarkdownNote = () => {
      const md = editorRef.current?.getMdValue()
      if (md) {
        props.saveText(md)
      }
    }
    document.addEventListener('saveMarkdownNote', saveMarkdownNote)
    return () => {
      document.removeEventListener('saveMarkdownNote', saveMarkdownNote)
    }
  }, [props, editorRef])

  return (
    <VStack
      css={{
        width: '100%',
        ...RcEditorStyles(isDark, true),
        pr: '25px',
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.code.toLowerCase() === 'escape') {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
    >
      <MdEditor
        key="note-editor"
        ref={editorRef}
        value={props.text}
        placeholder={props.placeHolder}
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
          'save',
        ]}
        style={{
          width: '100%',
          height: '180px',
        }}
        renderHTML={(text: string) => mdParser.render(text)}
        onChange={handleEditorChange}
      />
    </VStack>
  )
}
