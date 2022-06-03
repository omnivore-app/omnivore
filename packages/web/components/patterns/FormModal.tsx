import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../elements/ModalPrimitives'
import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { StyledText } from '../elements/StyledText'
import { useState } from 'react'
import { FormInput } from '../elements/FormElements'
import { CrossIcon } from '../elements/images/CrossIcon'
import { theme } from '../tokens/stitches.config'

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
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
          props.onOpenChange(false)
        }}
        css={{ overflow: 'auto', p: '0' }}
      >
        <VStack>
          <HStack
            distribution="between"
            alignment="center"
            css={{ width: '100%' }}
          >
            <StyledText style="modalHeadline" css={{ p: '16px' }}>
              {props.title}
            </StyledText>
            <Button
              css={{ pt: '16px', pr: '16px' }}
              style="ghost"
              onClick={() => {
                props.onOpenChange(false)
              }}
            >
              <CrossIcon
                size={20}
                strokeColor={theme.colors.grayText.toString()}
              />
            </Button>
          </HStack>
          <Box css={{ width: '100%' }}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                props.onSubmit()
                props.onOpenChange(false)
              }}
            >
              {inputs.map((input, index) => (
                <HStack key={index} css={{ padding: '10px 0 0 10px' }}>
                  <Box
                    css={{
                      p: '0',
                      width: '25%',
                      paddingLeft: '16px',
                      paddingTop: '5px',
                    }}
                  >
                    <StyledText style={'highlightTitle'}>
                      {input.label}
                    </StyledText>
                  </Box>
                  <Box css={{ width: '100%' }}>
                    <FormInput
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
                      css={{
                        border: '1px solid $grayBorder',
                        borderRadius: '8px',
                        width: '100%',
                        bg: 'transparent',
                        fontSize: '16px',
                        textIndent: '8px',
                        marginBottom: '2px',
                        color: '$grayTextContrast',
                        '&:focus': {
                          outline: 'none',
                          boxShadow:
                            '0px 0px 2px 2px rgba(255, 234, 159, 0.56)',
                        },
                      }}
                    />
                  </Box>
                </HStack>
              ))}
              <HStack
                alignment={'center'}
                distribution="center"
                css={{
                  padding: '20px 0 20px 0',
                }}
              >
                <Button
                  style={'ctaPill'}
                  onClick={() => props.onOpenChange(false)}
                  css={{ marginRight: '20px' }}
                >
                  Cancel
                </Button>
                <Button style={'ctaDarkYellow'}>
                  {props.acceptButtonLabel || 'Submit'}
                </Button>
              </HStack>
            </form>
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
