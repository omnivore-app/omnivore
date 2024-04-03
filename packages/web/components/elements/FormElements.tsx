import { styled } from '../tokens/stitches.config'
import { useState } from 'react'
import Checkbox from './Checkbox'
import { HStack, VStack } from './LayoutPrimitives'
import { Label } from '@radix-ui/react-dropdown-menu'

interface FormInputPropsOption {
  label: string
  value: string
}

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
  options?: string[] | FormInputPropsOption[]
  min?: any
}

export const FormInput = styled('input', {
  border: 'none',
  width: '100%',
  bg: 'transparent',
  fontSize: '16px',
  fontFamily: 'inter',
  fontWeight: 'normal',
  lineHeight: '1.35',
  borderRadius: '5px',
  textIndent: '8px',
  marginBottom: '2px',
  height: '38px',
  pl: '10px',
  color: '$grayTextContrast',
  '&:focus': {
    outline: 'none',
  },
  '@mdDown': {
    pl: '5px',
  },
})

export const FormLabel = styled('label', {
  fontSize: '16px',
  color: '$omnivoreGray',
  '&.required:after': {
    content: ' *',
    color: 'red',
  },
})

export const BorderedFormInput = styled(FormInput, {
  height: '40px',
  margin: '0',
  padding: '4px 11px',
  color: 'rgba(0,0,0,.88)',
  fontSize: '14px',
  lineHeight: '1.6',
  listStyle: 'none',
  width: '100%',
  minWidth: '0',
  backgroundColor: '#fff',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#d9d9d9',
  borderRadius: '6px',
  transition: 'all .2s',
  '&:focus': {
    border: '1px solid transparent',
    outline: '2px solid $omnivoreCtaYellow',
  },
})

export function GeneralFormInput(props: FormInputProps): JSX.Element {
  const [input, setInput] = useState<FormInputProps>(props)

  if (props.type === 'checkbox') {
    const StyledLabel = styled(Label, {
      color: '$grayTextContrast',
      fontSize: 13,
      padding: '5px 10px',
      cursor: 'default',
    })

    return (
      <VStack>
        {input.options?.map((option, index) => {
          if (typeof option === 'string') {
            return (
              <HStack key={index} alignment="center">
                <Checkbox
                  key={index}
                  checked={input.value[index]}
                  setChecked={(arg) => {
                    input.value[index] = arg
                    setInput(input)
                    props.onChange &&
                      props.onChange(
                        (input.options as string[]).filter(
                          (_, i) => input.value[i]
                        )
                      )
                  }}
                ></Checkbox>
                <StyledLabel>{option}</StyledLabel>
              </HStack>
            )
          } else {
            return (
              <HStack key={index} alignment="center">
                <Checkbox
                  key={index}
                  checked={input.value[index]}
                  setChecked={(arg) => {
                    input.value[index] = arg
                    setInput(input)
                    props.onChange &&
                      props.onChange(
                        (input.options as FormInputPropsOption[])
                          .filter((_, i) => input.value[i])
                          .map((option) => option.value)
                      )
                  }}
                ></Checkbox>
                <StyledLabel>{option.label}</StyledLabel>
              </HStack>
            )
          }
        })}
      </VStack>
    )
  } else if (props.type === 'select') {
    return (
      <select
        onChange={input.onChange}
        defaultValue={props.value}
        style={{
          padding: '8px',
          height: '38px',
          borderRadius: '6px',
          minWidth: '196px',
        }}
      >
        {input.options?.map((option, index) => {
          if (typeof option === 'string') {
            return (
              <option key={index} value={option}>
                {option}
              </option>
            )
          } else {
            return (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            )
          }
        })}
      </select>
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
            setInput({ ...input, value: event.target.value })
            input.onChange(event.target.value)
          }
        }}
        disabled={input.disabled}
        hidden={input.hidden}
        required={input.required}
        css={{
          border: '1px solid $textNonessential',
          borderRadius: '5px',
          width: '100%',
          bg: 'transparent',
          fontSize: '16px',
          textIndent: '8px',
          marginBottom: '2px',
          height: '38px',
          color: '$grayTextContrast',
          '&:focus': {
            border: '1px solid transparent',
            outline: '2px solid $omnivoreCtaYellow',
          },
        }}
        name={input.name}
        min={input.min}
      />
    )
  }
}
