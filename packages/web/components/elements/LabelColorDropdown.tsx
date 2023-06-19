import React, { useState } from 'react'
import { styled } from '../tokens/stitches.config'
import { Box, HStack, SpanBox } from './LayoutPrimitives'
import { StyledText } from './StyledText'
import {
  LabelColorDropdownProps,
  LabelColorObject,
  LabelOptionProps,
} from '../../utils/settings-page/labels/types'
import { labelColorObjects } from '../../utils/settings-page/labels/labelColorObjects'
import { isDarkTheme } from '../../lib/themeUpdater'
import { LabelColor } from '../../lib/networking/fragments/labelFragment'
import { TwitterPicker } from 'react-color'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

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
  const { isCreateMode, canEdit, labelId, labelColor, setLabelColor } = props
  const [open, setOpen] = useState<boolean | undefined>(false)

  const handleCustomColorChange = (color: string) => {
    setLabelColor(color.toUpperCase())
  }

  const handleOpen = (open: boolean) => {
    if (canEdit && open) setOpen(true)
    else if (isCreateMode && !canEdit && open) setOpen(true)
    else setOpen(false)
  }

  return (
    <DropdownMenu onOpenChange={handleOpen} open={open}>
      <DropdownMenuTrigger
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
          color={labelColor}
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
          color={labelColor}
          onChange={(color, event) => {
            console.log('changed to color: ', color)
            setLabelColor(color.hex)
            event.preventDefault()
          }}
          onChangeComplete={(color, event) => {
            console.log('onChangeComplete: ', color)
            setLabelColor(color.hex)
            event.preventDefault()
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LabelOption(props: LabelOptionProps): JSX.Element {
  const { color, isDropdownOption, isCreateMode, labelId } = props
  const { text, border, colorName, background } = getLabelColorObject(
    color as LabelColor
  )

  let colorNameText = colorName
  if (!labelId && isCreateMode) {
    colorNameText = 'Select Color'
    colorNameText = isDropdownOption ? colorName : colorNameText
  }

  colorNameText = color === 'custom color' ? colorNameText : colorName

  let colorHex = !labelId && isCreateMode && !isDropdownOption ? '' : text

  colorHex =
    !labelId && isCreateMode && !isDropdownOption && color !== 'custom color'
      ? text
      : colorHex

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
        <LabelColorIcon fillColor={text} strokeColor={border} />
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
        {colorHex}
      </StyledText>
    </HStack>
  )
}

function getLabelColorObject(color: LabelColor) {
  if (labelColorObjects[color]) {
    return labelColorObjects[color]
  }
  const colorObject: LabelColorObject = {
    colorName: 'Custom',
    text: color,
    border: color + '66',
    background: color + '0D',
  }
  return colorObject
}

function LabelColorIcon(props: {
  fillColor: string
  strokeColor: string
}): JSX.Element {
  return (
    <Box
      css={{
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        border: '2px solid',
        borderColor: props.strokeColor,
        backgroundColor: props.fillColor,
      }}
    />
  )
}
