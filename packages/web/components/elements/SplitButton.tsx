import { ReactNode, useEffect, useMemo, useRef } from 'react'
import { styled } from '../tokens/stitches.config'
import { Box, HStack, VStack } from './LayoutPrimitives'
import { Button } from './Button'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { ArrowDown } from 'phosphor-react'
import { Dropdown, DropdownOption } from './DropdownElements'
import { CaretDownIcon } from './icons/CaretDownIcon'

type SplitButtonProps = {
  title: string
}

const CaretButton = (): JSX.Element => {
  return (
    <VStack
      css={{
        width: '20px',
        height: '100%',
        alignItems: 'center',
        bg: '#6A6968',
        border: '0px solid transparent',
        borderTopRightRadius: '5px',
        borderBottomRightRadius: '5px',
        borderTopLeftRadius: '0px',
        borderBottomLeftRadius: '0px',
      }}
    >
      <CaretDownIcon size={8} color="#EDEDED" />
    </VStack>
  )
}

export const SplitButton = (props: SplitButtonProps): JSX.Element => {
  return (
    <HStack css={{ height: '27px', gap: '1px' }}>
      <Button
        css={{
          display: 'flex',
          minWidth: '70px',
          bg: '#6A6968',
          fontSize: '12px',
          fontFamily: '$inter',
          border: '0px solid transparent',
          borderTopLeftRadius: '5px',
          borderBottomLeftRadius: '5px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
          '&:hover': {
            opacity: 0.7,
            border: '0px solid transparent',
          },
          '&:focus': {
            outline: 'none',
            border: '0px solid transparent',
          },
        }}
      >
        {props.title}
      </Button>
      {/* <Divider></Divider> */}
      <Dropdown triggerElement={<CaretButton />}>
        <DropdownOption onSelect={() => console.log()} title="Archive (e)" />
      </Dropdown>
    </HStack>
  )
}
