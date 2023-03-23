import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { formattedShortTime } from '../../lib/dateFormatting'
import { createHighlightMutation } from '../../lib/networking/mutations/createHighlightMutation'
import { updateHighlightMutation } from '../../lib/networking/mutations/updateHighlightMutation'
import { Box, HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'

import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import ReactMarkdown from 'react-markdown'
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'
import throttle from 'lodash/throttle'
import { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { StyledText } from '../elements/StyledText'

const mdParser = new MarkdownIt()

type NoteSectionProps = {
  placeHolder: string
  mode: 'edit' | 'preview'

  pageId: string
  highlight?: Highlight

  sizeMode: 'normal' | 'maximized'
  setEditMode: (set: 'edit' | 'preview') => void
  //  dispatchList: Dispatch<HighlightListReducerAction>
}

export function HighlightNoteBox(props: NoteSectionProps): JSX.Element {
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
              // props.dispatchList({
              //   type: 'CREATE_NOTE',
              //   highlight: created,
              // })
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
        >
          <MdEditor
            value={noteText}
            autoFocus={true}
            placeholder={props.placeHolder}
            view={{ menu: true, md: true, html: false }}
            onBlur={() => {
              console.log(' BLURRING ')
              props.setEditMode('preview')
            }}
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
            {lastSaved !== undefined ? (
              <>
                {lastChanged === lastSaved
                  ? 'Saved'
                  : `Last saved ${formattedShortTime(lastSaved.toISOString())}`}
              </>
            ) : null}
          </HStack>
        </VStack>
      ) : (
        <VStack
          alignment="start"
          distribution="start"
          css={{
            width: '100%',
            // minHeight: '160px'
          }}
        >
          <StyledText
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
            <ReactMarkdown
              children={
                props.highlight?.annotation ?? 'Add notes to this document...'
              }
            />
          </StyledText>
        </VStack>
      )}
    </>
  )
}

// {!isEditing ? (
//   <StyledText
//     css={{
//       borderRadius: '5px',
//       p: '10px',
//       width: '100%',
//       marginTop: '15px',
//       color: '$thHighContrast',
//       border: '1px solid #EBEBEB',
//     }}
//     onClick={() => setIsEditing(true)}
//   >
//     {props.highlight.annotation
//       ? props.highlight.annotation
//       : 'Add notes to this highlight...'}
//   </StyledText>
// ) : null}
// {isEditing && (
