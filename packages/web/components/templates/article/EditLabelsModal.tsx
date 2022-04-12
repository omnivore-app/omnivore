import { X } from 'phosphor-react'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Button } from '../../elements/Button'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { Box, HStack, VStack } from '../../elements/LayoutPrimitives'
import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
} from '../../elements/ModalPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { EditLabelsControl } from './EditLabelsControl'

type EditLabelsModalProps = {
  article: ArticleAttributes
  onOpenChange: (open: boolean) => void
  articleActionHandler: (action: string, arg?: unknown) => void
}

export function EditLabelsModal(props: EditLabelsModalProps): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{ border: '1px solid $grayBorder' }}
        onPointerDownOutside={(event) => {
          event.preventDefault()
          props.onOpenChange(false)
        }}
      >
        <VStack css={{ width: '100%' }}>
          <HStack
              distribution="between"
              alignment="center"
              css={{ width: '100%' }}
            >
              <StyledText style="modalHeadline" css={{ pl: '16px' }}>Labels</StyledText>
              <Button
                css={{ pt: '16px', pr: '16px' }}
                style="ghost"
                onClick={() => {
                  props.onOpenChange(false)
                }}
              >
                <CrossIcon
                  size={14}
                  strokeColor={theme.colors.grayText.toString()}
                />
              </Button>
          </HStack>
          <EditLabelsControl {...props} />
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
