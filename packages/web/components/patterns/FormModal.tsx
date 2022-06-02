import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../elements/ModalPrimitives'
import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { StyledText } from '../elements/StyledText'
import { useState } from 'react'

export interface FormInputProps {
  name: string
  label: string
  value?: any
  onChange?: (value: any) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  required?: boolean
}

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
      <ModalContent>
        <HStack css={{ padding: '20px 20px 20px 20px' }} alignment={'center'}>
          <StyledText style="modalHeadline">{props.title}</StyledText>
        </HStack>
        <VStack alignment="center" distribution="center">
          <Box>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                props.onSubmit()
                props.onOpenChange(false)
              }}
            >
              {inputs.map((input, index) => (
                <HStack key={input.name}>
                  <StyledText>{input.label}</StyledText>
                  <input
                    key={input.name}
                    type={input.type || 'text'}
                    value={input.value}
                    placeholder={input.placeholder}
                    onChange={(event) => {
                      if (input.onChange) {
                        inputs[index].value = event.target.value
                        setInputs(inputs)
                        input.onChange(
                          event.target.value || event.target.checked
                        )
                      }
                    }}
                    disabled={input.disabled}
                    hidden={input.hidden}
                    required={input.required}
                    checked={input.value}
                  />
                </HStack>
              ))}
              <HStack distribution="center">
                <Button onClick={() => props.onOpenChange(false)}>
                  Cancel
                </Button>
                <Button>{props.acceptButtonLabel || 'Submit'}</Button>
              </HStack>
            </form>
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
