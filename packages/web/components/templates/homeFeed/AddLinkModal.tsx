import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../../elements/ModalPrimitives'
import { VStack, HStack, Box, SpanBox } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { theme } from '../../tokens/stitches.config'
import { FormInput } from '../../elements/FormElements'
import { useState, useCallback } from 'react'
import { createArticleFromURLMutation } from '../../../lib/networking/mutations/createArticleFromURLMutation'
import { saveUrlMutation } from '../../../lib/networking/mutations/saveUrlMutation'
import toast from 'react-hot-toast'
import { showErrorToast } from '../../../lib/toastHelpers'

type AddLinkModalProps = {
  onOpenChange: (open: boolean) => void
}

export function AddLinkModal(props: AddLinkModalProps): JSX.Element {
  const [link, setLink] = useState('')

  const handleLinkSubmission = useCallback(async (link: string) => {
    const result = await saveUrlMutation(link)
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
      showErrorToast('Error saving link', { position: 'bottom-right' })
    }
  }, [link])

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
  }, [link])

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{ bg: '$grayBg', height: '218px' }}
        onInteractOutside={() => {
          // remove focus from modal
          ;(document.activeElement as HTMLElement).blur()
        }}
      >
        <VStack distribution="start">
          <HStack
            distribution="between"
            alignment="center"
            css={{ width: '100%', mt: '4px', px: '16px', py: '16px' }}
          >
            <StyledText style="modalHeadline">Add a Link</StyledText>
            <Button
              css={{ cursor: 'pointer',  }}
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
          <Box css={{ width: '100%',  px: '16px', pt: '42px', pb: '24px' }}>
            <form
              onSubmit={(event) => {
                event.preventDefault()

                let submitLink = link
                if (!validateLink(link)) {
                  // If validation fails, attempting adding
                  // `https` to give the link a protocol.
                  const newLink = `https://${link}`
                  if (!validateLink(newLink)) {
                    showErrorToast('Invalid link', { position: 'bottom-right' })
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
                  p: '6px',
                }}
              />
              <HStack distribution="end" css={{ mt: '16px', width: '100%' }}>
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
