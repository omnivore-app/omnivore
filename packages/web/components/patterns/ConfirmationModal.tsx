import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../elements/ModalPrimitives'
import { VStack, HStack } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { StyledText } from '../elements/StyledText'

type ConfirmationModalProps = {
  message?: string
  icon?: React.ReactNode
  acceptButtonLabel?: string
  onAccept: () => void
  onOpenChange: (open: boolean) => void
}

export function ConfirmationModal(props: ConfirmationModalProps): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent css={{ bg: '$grayBg', maxWidth: '20em' }}>
        <VStack alignment="center" distribution="center" css={{ p: '$2' }}>
          {props.icon ? props.icon : null}
          <StyledText>{props.message}</StyledText>
          <HStack distribution="center" css={{ pt: '$2' }}>
            <Button
              style="ctaPill"
              css={{ mr: '$2' }}
              onClick={() => props.onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button style="ctaPill" onClick={props.onAccept}>
              {props.acceptButtonLabel ?? 'Confirm'}
            </Button>
          </HStack>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
