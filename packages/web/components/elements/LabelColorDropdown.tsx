import { useRef, useState } from 'react'
import { styled } from '../tokens/stitches.config'
import { Box, HStack } from './LayoutPrimitives'
import { StyledText } from './StyledText'
import {
  LabelColorDropdownProps,
  LabelOptionProps,
} from '../../utils/settings-page/labels/types'
import { TwitterPicker as TwitterPicker_, TwitterPickerProps } from 'react-color'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

// TwitterPicker is a Class component, but the types are broken in React 18.
// TODO: Maybe move away from this component, since it hasn't been updated for 3 years.
// https://github.com/casesandberg/react-color/issues/883
const TwitterPicker = TwitterPicker_ as unknown as React.FunctionComponent<TwitterPickerProps>

const DropdownMenuContent = styled(DropdownMenuPrimitive.Content, {
  borderRadius: 6,
  backgroundColor: '$grayBg',
  padding: 5,
})

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = styled(DropdownMenuPrimitive.Trigger, {
  backgroundColor: 'transparent',
  border: 0,
  padding: 0,
  marginRight: '$2',
})

export const LabelColorDropdown = (props: LabelColorDropdownProps) => {
  const pickerRef = useRef<HTMLButtonElement | null>(null)
  const { isCreateMode, canEdit } = props
  const [triangle, setTriangle] = useState<
    'top-left' | 'hide' | 'top-right' | undefined
  >('top-left')
  const [open, setOpen] = useState<boolean | undefined>(false)

  const handleOpen = (open: boolean) => {
    if (
      pickerRef.current &&
      window.innerHeight - pickerRef.current?.getBoundingClientRect().bottom <
        116
    ) {
      setTriangle('hide')
    } else {
      setTriangle('top-left')
    }

    if (canEdit && open) setOpen(true)
    else if (isCreateMode && !canEdit && open) setOpen(true)
    else setOpen(false)
  }

  return (
    <DropdownMenu onOpenChange={handleOpen} open={open}>
      <DropdownMenuTrigger
        ref={pickerRef}
        css={{
          minWidth: '64px',
          width: '100%',
          '@md': {
            minWidth: '170px',
            width: 'auto',
          },
          borderRadius: '6px',
          outlineStyle: 'solid',
          outlineColor: open ? '$omnivoreYellow' : 'transparent',
        }}
      >
        <LabelOption
          isCreateMode={isCreateMode}
          labelId={''}
          color={props.labelColor}
          isDropdownOption={false}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={10}
        onKeyUp={(event) => {
          switch (event.key) {
            case 'Escape':
              setOpen(false)
              event.preventDefault()
              break
            case 'Enter':
              setOpen(false)
              event.preventDefault()
              break
          }
        }}
      >
        <TwitterPicker
          triangle={triangle}
          color={props.labelColor}
          onChange={(color, event) => {
            props.setLabelColor(color.hex.toUpperCase())
            event.preventDefault()
          }}
          onChangeComplete={(color, event) => {
            props.setLabelColor(color.hex.toUpperCase())
            event.preventDefault()
          }}
          styles={{
            default: {
              input: {
                color: '$grayText',
              },
            },
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LabelOption(props: LabelOptionProps): JSX.Element {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        width: '100%',
        height: '35px',
        padding: '$2 0',
        border: '1px solid $grayBorder',
        borderRadius: '6px',
      }}
    >
      <Box
        css={{
          m: '10px',
          textTransform: 'capitalize',
          fontSize: '$3',
          whiteSpace: 'nowrap',
        }}
      >
        <LabelColorIcon color={props.color} />
      </Box>
      <StyledText
        css={{
          m: '0px',
          color: '$grayText',
          fontSize: '$3',
          whiteSpace: 'nowrap',
          '@md': {
            display: 'unset',
          },
        }}
      >
        {props.color}
      </StyledText>
    </HStack>
  )
}

function LabelColorIcon(props: { color: string }): JSX.Element {
  return (
    <Box
      css={{
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        border: '2px solid',
        borderColor: props.color,
        backgroundColor: props.color,
      }}
    />
  )
}
