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
  boxShadow:
    '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
})

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = styled(DropdownMenuPrimitive.Trigger, {
  backgroundColor: 'transparent',
  border: 0,
  padding: 0,
  marginRight: '$2',
})

// const MainContainer = styled(Box, {
//   fontFamily: 'inter',
//   fontSize: '$2',
//   lineHeight: '1.25',
//   color: '$grayText',
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   backgroundColor: '$grayBg',
//   border: '1px solid $grayBorder',
//   width: '180px',
//   borderRadius: '$3',
//   px: '$3',
//   py: '0px',
//   cursor: 'pointer',
//   '&:hover': {
//     border: '1px solid $grayBorderHover',
//   },
//   '@mdDown': {
//     width: '100%',
//   },
// })

const StyledLabel = styled('label', {
  position: 'relative',
  width: '154px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontSize: '13px',
  borderRadius: '50px',
  overflow: 'hidden',

  '>input': {
    position: 'absolute',
    width: '154px',
    height: '40px',

    appearance: 'none',
    '-moz-appearance': 'none',
    '-webkit-appearance': 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },

  '::-webkit-color-swatch': {
    border: 0,
    borderRadius: 0,
  },

  '::-moz-focus-inner': {
    padding: 0,
  },
})

export const LabelColorDropdown = (props: LabelColorDropdownProps) => {
  const { isCreateMode, canEdit, labelId, labelColor, setLabelColor } = props

  const isDarkMode = isDarkTheme()
  const iconColor = isDarkMode ? '#FFFFFF' : '#0A0806'
  const [colorPickerValue, setColorPickerValue] = useState(props.labelColor)
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
        }}
      >
        <SpanBox css={{ paddingRight: '$3' }}>
          <LabelOption
            isCreateMode={isCreateMode}
            labelId={''}
            color={labelColor}
            isDropdownOption={false}
          />
        </SpanBox>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={-10}>
        <TwitterPicker />
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <Box
      css={{
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
      }}
    >
      <StyledLabel>
        <input
          type="color"
          value={colorPickerValue}
          onChange={(event) => {
            // setColorPickerValue(event.target.value)
            handleCustomColorChange(event.target.value)
            event.preventDefault()
          }}
        />
        <SpanBox css={{ zIndex: '19', gap: '5px' }}>
          {labelId ? (
            <LabelOption
              isCreateMode={isCreateMode}
              labelId={labelId}
              color={labelColor}
              isDropdownOption={false}
            />
          ) : (
            <LabelOption
              isCreateMode={isCreateMode}
              labelId={''}
              color={labelColor}
              isDropdownOption={false}
            />
          )}
        </SpanBox>
      </StyledLabel>
    </Box>
  )

  // return (
  //   <DropdownMenu onOpenChange={handleOpen} open={open}>
  //     <DropdownMenuTrigger
  //       css={{
  //         minWidth: '64px',
  //         width: '100%',
  //         '@md': {
  //           minWidth: '170px',
  //           width: 'auto',
  //         },
  //       }}
  //     >
  //       <MainContainer>
  //         <SpanBox css={{ paddingRight: '$3' }}>
  //           {labelId !== '' && labelId === labelColorHexRowId ? (
  //             <LabelOption
  //               isCreateMode={isCreateMode}
  //               labelId={labelId}
  //               color={labelColorHexValue}
  //               isDropdownOption={false}
  //             />
  //           ) : (
  //             <>
  //               {labelId ? (
  //                 <LabelOption
  //                   isCreateMode={isCreateMode}
  //                   labelId={labelId}
  //                   color={labelColor}
  //                   isDropdownOption={false}
  //                 />
  //               ) : (
  //                 <LabelOption
  //                   isCreateMode={isCreateMode}
  //                   labelId={''}
  //                   color={labelColorHexValue}
  //                   isDropdownOption={false}
  //                 />
  //               )}
  //             </>
  //           )}
  //         </SpanBox>

  //         <CaretDown size={16} color={iconColor} weight="bold" />
  //       </MainContainer>
  //     </DropdownMenuTrigger>

  //     <DropdownMenuContent sideOffset={5}>
  //       <input type="color"></input>
  //     </DropdownMenuContent>
  //   </DropdownMenu>
  // )
}

function LabelOption(props: LabelOptionProps): JSX.Element {
  const { color, isDropdownOption, isCreateMode, labelId } = props
  // const colorDetails = getColorDetails(
  //   color as LabelColor,
  //   labelId,
  //   Boolean(isCreateMode)
  // )
  const isCreating = isCreateMode && !labelId
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
      css={{ width: '100%', padding: isDropdownOption ? '' : '$2 0' }}
    >
      <Box
        css={{
          m: '$1',
          textTransform: 'capitalize',
          fontSize: '$3',
          whiteSpace: 'nowrap',
        }}
      >
        <LabelColorIcon fillColor={text} strokeColor={border} />
      </Box>
      <StyledText
        css={{
          m: '$1',
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
      {isDropdownOption ? <Box css={{ pr: '$2' }} /> : null}
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
