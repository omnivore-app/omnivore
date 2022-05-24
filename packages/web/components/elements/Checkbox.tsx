import React from 'react'
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

export const CheckboxComponent:React.FC<{
  checked: boolean;
  setChecked:(arg: boolean) => void;
}> = ({checked, setChecked}) => {
  const toggleChecked = () => setChecked(!checked);

  return (
    <Checkbox css={{
      border: checked ? '2px solid #F9D354': '2px solid #3F3E3C4D',
      backgroundColor: checked ? '#F9D354' : '#FFFFFF'
    }} checked={checked} onCheckedChange={toggleChecked}>
      <CheckboxIndicator>
        <CheckIcon />
      </CheckboxIndicator>
    </Checkbox>
  )
}

export default CheckboxComponent
