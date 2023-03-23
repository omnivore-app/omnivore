import { useCallback, useState } from 'react'
import { Highlight } from '../../lib/networking/fragments/highlightFragment'
import { updateHighlightMutation } from '../../lib/networking/mutations/updateHighlightMutation'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { Button } from './Button'
import { HStack, VStack } from './LayoutPrimitives'
import { StyledTextArea } from './StyledTextArea'

type HighlightNoteTextEditAreaProps = {
  setIsEditing: (editing: boolean) => void
  highlight: Highlight
  updateHighlight: (highlight: Highlight) => void
}

export const HighlightNoteTextEditArea = (
  props: HighlightNoteTextEditAreaProps
): JSX.Element => {
  const [noteContent, setNoteContent] = useState(
    props.highlight.annotation ?? ''
  )

  const handleNoteContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setNoteContent(event.target.value)
    },
    [setNoteContent]
  )

  return (
    <VStack css={{ width: '100%' }} key="textEditor">
      <StyledTextArea
        css={{
          my: '10px',
          minHeight: '200px',
          borderRadius: '5px',
          p: '10px',
          width: '100%',
          marginTop: '16px',
          resize: 'vertical',
          bg: '#EBEBEB',
          color: '#3D3D3D',
        }}
        autoFocus
        maxLength={4000}
        value={noteContent}
        placeholder={'Add notes to this highlight...'}
        onChange={handleNoteContentChange}
      />
      <HStack alignment="center" distribution="end" css={{ width: '100%' }}>
        <Button
          style="cancelGeneric"
          css={{ mr: '$2' }}
          onClick={() => {
            props.setIsEditing(false)
            setNoteContent(props.highlight.annotation ?? '')
          }}
        >
          Cancel
        </Button>
        <Button
          style="ctaDarkYellow"
          onClick={async (e) => {
            e.preventDefault()
            try {
              const result = await updateHighlightMutation({
                highlightId: props.highlight.id,
                annotation: noteContent,
              })
              console.log('result: ' + result)

              if (!result) {
                showErrorToast('There was an error updating your highlight.')
              } else {
                showSuccessToast('Note saved')
                props.highlight.annotation = noteContent
                props.updateHighlight(props.highlight)
              }
            } catch (err) {
              console.log('error updating annoation', err)
              showErrorToast('There was an error updating your highlight.')
            }

            props.setIsEditing(false)
          }}
        >
          Save
        </Button>
      </HStack>
    </VStack>
  )
}
