import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../../elements/ModalPrimitives'
import { VStack, HStack, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { theme } from '../../tokens/stitches.config'
import { FormInput } from '../../elements/FormElements'
import { useState, useCallback } from 'react'
import { createArticleFromURLMutation } from '../../../lib/networking/mutations/createArticleFromURLMutation'
import toast from 'react-hot-toast'

type AddLinkModalProps = {
  onOpenChange: (open: boolean) => void
}

export function AddLinkModal(props: AddLinkModalProps): JSX.Element {
  const [link, setLink] = useState('')

  const handleLinkSubmission = useCallback(async (link: string) => {
    const result = await createArticleFromURLMutation({ url: link })
    // const result = await saveUrlMutation(link)
    if (result && result.jobId) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toast((t) => (
        <Box>
          Link Saved
          <span style={{ padding: '16px' }} />
          <Button
            style="ctaDarkYellow"
            autoFocus
            onClick={() => {
              window.location.href = `/article/sr/${result.jobId}`
            }}
          >
            Read Now
          </Button>
        </Box>
      ), { position: 'bottom-right' })
    } else {
      toast.error('Error saving link', { position: 'bottom-right' })
    }
  }, [])

  const validateLink = useCallback((link: string) => {
    try {
      const url = new URL(link)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        return false
      }
    } catch (e) {
      return false
    }
    return true
  }, [])

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{ bg: '$grayBg', maxWidth: '20em', pt: '0px' }}
        onInteractOutside={() => {
          // remove focus from modal
          ;(document.activeElement as HTMLElement).blur()
        }}
      >
        <VStack distribution="start" css={{ p: '$2' }}>
          <HStack
            distribution="between"
            alignment="center"
            css={{ width: '100%', mt: '4px' }}
          >
            <StyledText style="modalHeadline">Add a Link</StyledText>
            <Button
              css={{ p: '10px', cursor: 'pointer', pt: '2px' }}
              style="ghost"
              onClick={() => {
                props.onOpenChange(false)
              }}
            >
              <CrossIcon
                size={11}
                strokeColor={theme.colors.grayTextContrast.toString()}
              />
            </Button>
          </HStack>
          <StyledText css={{ mt: '22px', mb: '6px' }}>Link</StyledText>
          <Box css={{ width: '100%' }}>
            <form
              onSubmit={(event) => {
                event.preventDefault()

                let submitLink = link
                if (!validateLink(link)) {
                  // If validation fails, attempting adding
                  // `https` to give the link a protocol.
                  const newLink = `https://${link}`
                  if (!validateLink(newLink)) {
                    toast.error('Invalid link', { position: 'bottom-right' })
                    return
                  }
                  setLink(newLink)
                  submitLink = newLink
                }
                handleLinkSubmission(submitLink)
                props.onOpenChange(false)
              }}
            >
              <FormInput
                type="text"
                value={link}
                autoFocus
                placeholder="https://example.com"
                onChange={(event) => setLink(event.target.value)}
                css={{
                  borderRadius: '8px',
                  border: '1px solid $grayTextContrast',
                  width: '100%',
                  p: '$2',
                }}
              />
              <HStack distribution="center" css={{ mt: '12px', width: '100%' }}>
                <Button style="ctaDarkYellow" css={{ mb: '0px' }}>
                  Add Link
                </Button>
              </HStack>
            </form>
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
