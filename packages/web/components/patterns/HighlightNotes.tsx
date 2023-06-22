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
import { RcEditorStyles } from './RcEditorStyles'
import { isDarkTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'

const mdParser = new MarkdownIt()

MdEditor.use(Plugins.TabInsert, {
  tabMapValue: 1, // note that 1 means a '\t' instead of ' '.
})

type NoteSectionProps = {
  targetId: string

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
      targetId={props.targetId}
      placeHolder={props.placeHolder}
      mode={props.mode}
      sizeMode={props.sizeMode}
      setEditMode={props.setEditMode}
      text={props.text}
      saveText={saveText}
      lastSaved={lastSaved}
      fillBackground={false}
    />
  )
}

type HighlightViewNoteProps = {
  targetId: string

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
          showSuccessToast('Note saved.', {
            position: 'bottom-right',
          })
        } else {
          showErrorToast('Error saving note.', {
            position: 'bottom-right',
          })
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
      sizeMode={props.sizeMode}
      setEditMode={props.setEditMode}
      text={props.text}
      saveText={saveText}
      lastSaved={lastSaved}
      fillBackground={true}
    />
  )
}

type MarkdownNote = {
  targetId: string

  placeHolder: string
  mode: 'edit' | 'preview'

  sizeMode: 'normal' | 'maximized'
  setEditMode: (set: 'edit' | 'preview') => void

  text: string | undefined
  fillBackground: boolean | undefined

  lastSaved: Date | undefined
  saveText: (text: string, updateTime: Date) => void
}

export function MarkdownNote(props: MarkdownNote): JSX.Element {
  const editorRef = useRef<MdEditor | null>(null)
  const [lastChanged, setLastChanged] = useState<Date | undefined>(undefined)
  const [errorSaving, setErrorSaving] = useState<string | undefined>(undefined)
  const isDark = isDarkTheme()

  return (
    <>
      {props.mode == 'edit' ? (
        <VStack
          css={{
            width: '100%',
            ...RcEditorStyles(isDark),
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
              height: props.sizeMode == 'normal' ? '160px' : '320px',
            }}
            renderHTML={(text: string) => mdParser.render(text)}
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
            <SpanBox
              css={{
                fontSize: '9px',
                mt: '10px',
                color: 'green',
                marginLeft: 'auto',
              }}
            >
              <Button
                style="ctaDarkYellow"
                onClick={(event) => {
                  const value = editorRef.current?.getMdValue()
                  if (value) {
                    props.saveText(value, new Date())
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
              p: '5px',
              width: '100%',
              fontSize: '12px',
              marginTop: '0px',
              paddingTop: '0px',

              paddingLeft:
                props.fillBackground && props.text
                  ? '10px'
                  : !props.text
                  ? '5px'
                  : '0px',
              paddingRight:
                props.fillBackground && props.text
                  ? '10px'
                  : !props.text
                  ? '5px'
                  : '0px',
              color: props.text ? '$thHighContrast' : '#898989',
              // border: props.text ? 'unset' : '1px solid $thBorderColor',
              background:
                props.text && props.fillBackground ? '$thBackground5' : 'unset',
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

type MarkdownModalProps = {
  targetId: string

  placeHolder: string
  mode: 'edit' | 'preview'

  sizeMode: 'normal' | 'maximized'
  setEditMode: (set: 'edit' | 'preview') => void

  text: string | undefined
  saveText: (text: string, completed: (success: boolean) => void) => void
}

export function MarkdownModal(props: MarkdownModalProps): JSX.Element {
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

  const handleClose = useCallback(() => {
    console.log('onOpenChange')
  }, [])

  return (
    <ModalRoot
      defaultOpen
      onOpenChange={handleClose}
      css={{ width: '100%', height: '100%' }}
    >
      <ModalOverlay css={{ width: '100%', height: '100%' }} />
      <ModalContent
        css={{
          bg: '$grayBg',
          zIndex: '30',
          width: '100%',
          height: '100%',
          maxHeight: 'unset',
          maxWidth: 'unset',
        }}
      >
        <VStack>
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
              Edit Note
            </StyledText>
            <HStack
              css={{
                ml: 'auto',
                cursor: 'pointer',
                gap: '15px',
                mr: '-5px',
              }}
              distribution="center"
              alignment="center"
            >
              {/* <Dropdown triggerElement={<MenuTrigger />}>
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
            </Dropdown> */}
              <CloseButton close={handleClose} />
            </HStack>
          </HStack>
          <SpanBox css={{ padding: '20px', width: '100%', height: '100%' }}>
            <MarkdownNote
              targetId={props.targetId}
              placeHolder={props.placeHolder}
              mode={props.mode}
              sizeMode={props.sizeMode}
              setEditMode={props.setEditMode}
              text={props.text}
              saveText={saveText}
              lastSaved={lastSaved}
              fillBackground={false}
            />
          </SpanBox>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
