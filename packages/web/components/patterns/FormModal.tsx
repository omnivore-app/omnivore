import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../elements/ModalPrimitives'
import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { StyledText } from '../elements/StyledText'
import { useState } from 'react'
import { FormInputProps, GeneralFormInput } from '../elements/FormElements'
import { CrossIcon } from '../elements/images/CrossIcon'
import { theme } from '../tokens/stitches.config'

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
                    <StyledText style={'menuTitle'}>
                      {input.label}
                    </StyledText>
                  </Box>
                  <Box css={{ width: '100%', marginRight: '20px' }}>
                    <GeneralFormInput {...input} />
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
