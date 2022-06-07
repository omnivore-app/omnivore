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
import { LibraryItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { StyledTextArea } from '../../elements/StyledTextArea'
import { updatePageMutation } from '../../../lib/networking/mutations/updatePageMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'

type EditTitleModalProps = {
  onOpenChange: (open: boolean) => void
  item: LibraryItem
  updateItem: (item: LibraryItem) => Promise<void>,
}

export function EditTitleModal(props: EditTitleModalProps): JSX.Element {
  const [title, setTitle] = useState(props.item.node.title)
  const [description, setDescription] = useState(props.item.node.description)

  const handleUpdateTitle = async () => {
    if (title !== '') {
      const res = await updatePageMutation({
        pageId: props.item.node.id,
        title,
        description,
      })

      if (res) {
        await props.updateItem({
          cursor: props.item.cursor,
          node: {
            ...props.item.node,
            title: title,
            description: description,
          },
        })
        showSuccessToast('Link updated succesfully', {
          position: 'bottom-right',
        })
        props.onOpenChange(false)
      } else {
        showErrorToast('There was an error updating your link', {
          position: 'bottom-right',
        })
      }
    } else {
      showErrorToast('Title can\'t be empty', {
        position: 'bottom-right',
      })
    }
  }

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{ bg: '$grayBg', maxWidth: '20em', pt: '0px' }}
        onInteractOutside={() => {
          // remove focus from modal
          (document.activeElement as HTMLElement).blur()
        }}
      >
        <VStack distribution="start" css={{ p: '$2' }}>
          <HStack
            distribution="between"
            alignment="center"
            css={{ width: '100%', mt: '4px' }}
          >
            <StyledText style="modalHeadline">
              Edit Title or Description
            </StyledText>
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
          <StyledText css={{ mt: '22px', mb: '6px' }}>Title</StyledText>
          <Box css={{ width: '100%' }}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <FormInput
                type="text"
                value={title}
                autoFocus
                placeholder="Edit Title"
                onChange={(event) => setTitle(event.target.value)}
                css={{
                  borderRadius: '8px',
                  border: '1px solid $grayTextContrast',
                  width: '100%',
                  p: '$2',
                }}
              />
              <StyledText css={{ mt: '22px', mb: '6px' }}>
                Description
              </StyledText>
              <Box
                css={{
                  border: '1px solid $grayTextContrast',
                  borderRadius: '8px',
                }}
              >
                <StyledTextArea
                  css={{
                    mt: '$2',
                    width: '95%',
                    p: '$1',
                    height: '$6',
                  }}
                  placeholder="Edit Description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={4000}
                />
              </Box>
              <HStack distribution="end" css={{ mt: '12px', width: '100%' }}>
                <Button
                  onClick={() => props.onOpenChange(false)}
                  style="ctaGray"
                  css={{ mr: '16px' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateTitle}
                  style="ctaDarkYellow"
                  css={{ mb: '0px' }}
                >
                  Save
                </Button>
              </HStack>
            </form>
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
