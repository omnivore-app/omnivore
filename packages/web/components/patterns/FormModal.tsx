import {
  ModalButtonBar,
  ModalContent,
  ModalOverlay,
  ModalRoot,
  ModalTitleBar,
} from '../elements/ModalPrimitives'
import { Box, VStack } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { FormInputProps, GeneralFormInput } from '../elements/FormElements'

export interface FormModalProps {
  inputs?: FormInputProps[]
  title: string
  acceptButtonLabel?: string
  onSubmit: () => void
  onOpenChange: (open: boolean) => void
}

export function FormModal(props: FormModalProps): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
          props.onOpenChange(false)
        }}
        css={{ overflow: 'auto', px: '24px' }}
      >
        <VStack>
          <ModalTitleBar
            title={props.title}
            onOpenChange={props.onOpenChange}
          />
          <Box css={{ width: '100%' }}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                props.onSubmit()
                props.onOpenChange(false)
              }}
            >
              {props.inputs?.map((input, index) => (
                <VStack key={index}>
                  <StyledText
                    style={'menuTitle'}
                    css={{ pt: index > 0 ? '10px' : 'unset' }}
                  >
                    {input.label}
                  </StyledText>
                  <Box css={{ width: '100%' }}>
                    <GeneralFormInput {...input} />
                  </Box>
                </VStack>
              ))}
              <ModalButtonBar
                onOpenChange={props.onOpenChange}
                acceptButtonLabel={props.acceptButtonLabel}
              />
            </form>
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
