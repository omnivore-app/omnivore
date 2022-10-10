import {
  ModalButtonBar,
  ModalContent,
  ModalOverlay,
  ModalRoot,
  ModalTitleBar,
} from '../elements/ModalPrimitives'
import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { StyledText } from '../elements/StyledText'
import { useState } from 'react'
import { FormInputProps, GeneralFormInput } from '../elements/FormElements'
import { theme } from '../tokens/stitches.config'
import { X } from 'phosphor-react'

export interface FormModalProps {
  inputs?: FormInputProps[]
  title: string
  acceptButtonLabel?: string
  onSubmit: () => void
  onOpenChange: (open: boolean) => void
}

export function FormModal(props: FormModalProps): JSX.Element {
  const [inputs, setInputs] = useState<FormInputProps[]>(props.inputs || [])

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
              {inputs.map((input, index) => (
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
