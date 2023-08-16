import React, { useState } from 'react'
import { styled } from '@stitches/react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from './images/CheckIcon'

const Checkbox = styled(CheckboxPrimitive.Root, {
  all: 'unset',
  width: 16,
  height: 16,
  minWidth: 16,
  minHeight: 16,
  borderRadius: 3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const CheckboxIndicator = styled(CheckboxPrimitive.Indicator, {
  color: '#FFFFFF',
})

interface CheckboxProps extends CheckboxPrimitive.CheckboxProps {
  setChecked?: (arg: boolean) => void
}

export const CheckboxComponent: React.FC<CheckboxProps> = (props) => {
  const [checked, setChecked] = useState<CheckboxPrimitive.CheckedState>(
    props.defaultChecked || props.checked || false
  )

  return (
    <Checkbox
      {...props}
      css={{
        border: checked ? '2px solid #F9D354' : '2px solid #3F3E3C4D',
        backgroundColor: checked ? '#F9D354' : '#FFFFFF',
        cursor: 'pointer',
      }}
      defaultChecked={props.defaultChecked}
      checked={checked}
      onCheckedChange={(checked) => {
        setChecked(checked)
        if (props.onCheckedChange) {
          props.onCheckedChange(checked)
        }
      }}
    >
      <CheckboxIndicator>
        <CheckIcon />
      </CheckboxIndicator>
    </Checkbox>
  )
}

export default CheckboxComponent
