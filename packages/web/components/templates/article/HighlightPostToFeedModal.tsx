import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from './../../elements/ModalPrimitives'
import { Box, HStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import { HighlightView } from '../../patterns/HighlightView'
import { useCallback, useState } from 'react'
import { StyledTextArea } from '../../elements/StyledTextArea'

type HighlightPostToFeedModalProps = {
  highlight: Highlight
  author: string
  title: string
  onCommit: (highlight: Highlight, comment: string) => void
  onOpenChange: (open: boolean) => void
}

export function HighlightPostToFeedModal(
  props: HighlightPostToFeedModalProps
): JSX.Element {
  const [comment, setComment] = useState('')

  const handleCommentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setComment(event.target.value)
    },
    [setComment]
  )

  const postHighlight = useCallback(async () => {
    props.onCommit(props.highlight, comment)
    props.onOpenChange(false)
  }, [comment, props])

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
        css={{ overflow: 'auto' }}
      >
        <Box
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            px: '$2',
          }}
        >
          <Button
            style="ctaSecondary"
            onClick={() => {
              props.onOpenChange(false)
            }}
            css={{ justifySelf: 'start' }}
          >
            Cancel
          </Button>
          <HStack alignment="center">
            <StyledText>Post Highlight</StyledText>
          </HStack>
          <Button
            style="ctaSecondary"
            onClick={postHighlight}
            css={{ justifySelf: 'end' }}
          >
            Post
          </Button>
        </Box>
        <HighlightView {...props} />
        <StyledTextArea
          css={{
            mt: '$2',
            width: '95%',
            p: '$1',
            minHeight: '$6',
          }}
          autoFocus
          placeholder={'Leave comment (optional)'}
          value={comment}
          onChange={handleCommentChange}
          maxLength={1000}
        />
      </ModalContent>
    </ModalRoot>
  )
}
