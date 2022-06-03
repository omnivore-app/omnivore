import { styled } from '../tokens/stitches.config'
import { useState } from 'react'
import Checkbox from './Checkbox'
import { Box, HStack, VStack } from './LayoutPrimitives'
import { StyledText } from './StyledText'

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
  css?: any
  labels?: string[]
}

export const FormInput = styled('input', {
  border: 'none',
  width: '100%',
  bg: 'transparent',
  fontSize: '16px',
  fontFamily: 'inter',
  fontWeight: 'normal',
  lineHeight: '1.35',
  color: '$grayTextContrast',
  '&:focus': {
    outline: 'none',
  },
})

export const BorderedFormInput = styled(FormInput, {
  borderRadius: '6px',
  border: `1px solid $grayBorder`,
  p: '$3',
})

export function GeneralFormInput(props: FormInputProps): JSX.Element {
  const [input, setInput] = useState<FormInputProps>(props)

  if (props.type === 'checkbox') {
    return (
      <VStack>
        {input.labels?.map((label, index) => (
          <HStack key={index}>
            <StyledText>{label}</StyledText>
            <Box css={{ padding: '10px 0 0 10px' }}>
              <Checkbox
                key={index}
                checked={input.value[index]}
                setChecked={(arg) => {
                  input.value[index] = arg
                  setInput(input)
                  props.onChange &&
                    props.onChange(
                      input.labels?.filter((_, i) => input.value[i])
                    )
                }}
              ></Checkbox>
            </Box>
          </HStack>
        ))}
      </VStack>
    )
  } else {
    return (
      <FormInput
        key={input.name}
        type={input.type || 'text'}
        value={input.value}
        placeholder={input.placeholder}
        onChange={(event) => {
          if (input.onChange) {
            // input.value = event.target.value
            setInput(input)
            input.onChange(event.target.value)
          }
        }}
        disabled={input.disabled}
        hidden={input.hidden}
        required={input.required}
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
            boxShadow: '0px 0px 2px 2px rgba(255, 234, 159, 0.56)',
          },
        }}
        name={input.name}
      />
    )
  }
}
