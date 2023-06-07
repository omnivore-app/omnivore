import React from 'react'
import { styled } from '@stitches/react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from './images/CheckIcon'
import { Box } from './LayoutPrimitives'
import { Check } from 'phosphor-react'

// const Checkbox = styled(CheckboxPrimitive.Root, {
//   all: 'unset',
//   width: 15,
//   height: 15,
//   borderRadius: 2,
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
// })

// const CheckboxIndicator = styled(CheckboxPrimitive.Indicator, {
//   color: '#FFFFFF',
// })

const CheckboxRoot = styled(CheckboxPrimitive.Root, {
  all: 'unset',
  backgroundColor: 'white',
  width: 25,
  height: 25,
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 2px 10px black`,
  '&:hover': { backgroundColor: 'violet' },
  '&:focus': { boxShadow: `0 0 0 2px black` },
})

const CheckboxIndicator = styled(CheckboxPrimitive.Indicator, {
  color: 'violet',
})

export const CheckboxComponent: React.FC<{
  checked: boolean
  setChecked: (arg: boolean) => void
}> = ({ checked, setChecked }) => {
  const toggleChecked = () => setChecked(!checked)

  return (
    <form>
      <Box css={{ alignItems: 'center' }}>
        <CheckboxRoot defaultChecked id="c1">
          <CheckboxIndicator>
            <Check size={20} color="black" />
          </CheckboxIndicator>
        </CheckboxRoot>
      </Box>
    </form>
  )
}

export default CheckboxComponent
