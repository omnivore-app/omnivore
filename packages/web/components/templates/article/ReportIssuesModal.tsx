import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from './../../elements/ModalPrimitives'
import { Box, HStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { useCallback, useState } from 'react'
import { StyledTextArea } from '../../elements/StyledTextArea'

type ReportIssuesModalProps = {
  onCommit: (comment: string) => void
  onOpenChange: (open: boolean) => void
}

export function ReportIssuesModal(props: ReportIssuesModalProps): JSX.Element {
  const [comment, setComment] = useState('')

  const handleCommentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setComment(event.target.value)
    },
    [setComment]
  )

  const submitReport = useCallback(async () => {
    props.onCommit(comment)
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
            <StyledText>Report Issue</StyledText>
          </HStack>
          <Button
            style="ctaSecondary"
            onClick={submitReport}
            css={{ justifySelf: 'end' }}
          >
            Submit
          </Button>
        </Box>
        <StyledTextArea
          css={{
            mt: '$2',
            width: '95%',
            p: '$1',
            minHeight: '$6',
          }}
          autoFocus
          placeholder={'Add any additional comments (optional)'}
          value={comment}
          onChange={handleCommentChange}
          maxLength={1000}
        />
      </ModalContent>
    </ModalRoot>
  )
}
