import { styled } from '../tokens/stitches.config'
import { ChangeEventHandler } from 'react'
import { HStack, VStack } from './LayoutPrimitives'
import type { CSS } from '@stitches/react/types/css-util'
import Checkbox from './Checkbox'
import { CheckboxProps } from '@radix-ui/react-checkbox'
import { WebhookEvent } from '../../lib/networking/queries/useGetWebhooksQuery'

interface SelectOptionProps {
  label: string
  value: string
}

export interface MultiCheckboxOption extends CheckboxProps {
  label: string
  value: WebhookEvent
  defaultChecked: boolean
}

interface BaseInputProps extends React.HTMLProps<HTMLInputElement> {
  name: string
  label: string
  type: 'checkbox' | 'select' | 'text'
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  required?: boolean
  css?: CSS
  value?: HTMLInputElement['value']
  onChange?: ChangeEventHandler<HTMLInputElement>
}

export interface SelectProps extends Omit<BaseInputProps, 'onChange'> {
  type: 'select'
  options?: SelectOptionProps[]
  onChange?: ChangeEventHandler<HTMLSelectElement>
}

export interface MultiCheckboxProps
  extends Omit<BaseInputProps, 'value' | 'checked' | 'type' | 'onChange'> {
  // To render a checkbox for each value provided under a single common label.
  // The common label value for all checkboxes is rendered through the `label` prop provided to MultiCheckbox
  type: 'multi-checkbox'
  options: MultiCheckboxOption[]
}

export type FormInputProps = SelectProps | BaseInputProps | MultiCheckboxProps

function isSelectProps(props: FormInputProps): props is SelectProps {
  return props.type === 'select'
}

function isMultiCheckboxProps(
  props: FormInputProps
): props is MultiCheckboxProps {
  return props.type === 'multi-checkbox'
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
})

export function GeneralFormInput(props: FormInputProps): JSX.Element {
  if (isMultiCheckboxProps(props)) {
    const StyledLabel = styled('label', {
      color: '$grayTextContrast',
      fontSize: 13,
      padding: '5px 10px',
      cursor: 'default',
    })

    return (
      <VStack>
        {props.options?.map((checkboxOptions, index) => {
          const checkboxId = `${checkboxOptions.label}-${checkboxOptions.value}-${index}`
          return (
            <HStack key={index} alignment="center">
              <Checkbox
                {...checkboxOptions}
                value={checkboxOptions.value}
                name={checkboxOptions.label}
                defaultChecked={checkboxOptions.defaultChecked}
                id={checkboxId}
              />
              <StyledLabel htmlFor={checkboxId}>
                {checkboxOptions.label}
              </StyledLabel>
            </HStack>
          )
        })}
      </VStack>
    )
  } else if (isSelectProps(props)) {
    return (
      <select
        onChange={props.onChange}
        defaultValue={props.value}
        style={{
          padding: '8px',
          height: '38px',
          borderRadius: '6px',
          minWidth: '196px',
        }}
      >
        {props.options?.map((option, index) => {
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
        key={props.name}
        type={props.type || 'text'}
        defaultValue={props.value}
        placeholder={props.placeholder}
        onChange={(event) => {
          if (props.onChange) {
            props.onChange(event)
          }
        }}
        disabled={props.disabled}
        hidden={props.hidden}
        required={props.required}
        css={{
          border: '1px solid $textNonessential',
          borderRadius: '8px',
          width: '100%',
          bg: 'transparent',
          fontSize: '16px',
          textIndent: '8px',
          marginBottom: '2px',
          height: '38px',
          color: '$grayTextContrast',
          '&:focus': {
            outline: 'none',
            boxShadow: '0px 0px 2px 2px rgba(255, 234, 159, 0.56)',
          },
        }}
        name={props.name}
        min={props.min}
      />
    )
  }
}
