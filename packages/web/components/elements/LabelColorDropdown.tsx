import React, { useState } from 'react'
import { styled } from '../tokens/stitches.config'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { HexColorPicker } from 'react-colorful'
import { Button } from './Button'
import { HStack, SpanBox } from './LayoutPrimitives'
import { CaretDown } from 'phosphor-react'
import { StyledText } from './StyledText'
import {
  ColorDetailsProps,
  LabelColor,
  LabelColorDropdownProps,
  LabelColorHex,
  LabelColorObject,
  LabelOptionProps,
} from '../../utils/settings-page/labels/types'
import { labelColorObjects } from '../../utils/settings-page/labels/labelColorObjects'
import { DropdownOption } from './DropdownElements'
import { isDarkTheme } from '../../lib/themeUpdater'

const DropdownMenuContent = styled(DropdownMenuPrimitive.Content, {
  maxWidth: 190,
  borderRadius: 6,
  backgroundColor: '$grayBg',
  padding: 5,
  boxShadow:
    '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
})

const itemStyles = {
  all: 'unset',
  fontSize: '$3',
  lineHeight: 1,
  borderRadius: 3,
  display: 'flex',
  alignItems: 'center',
  height: 25,
  position: 'relative',
  userSelect: 'none',
}

const DropdownMenuTriggerItem = styled(DropdownMenuPrimitive.TriggerItem, {
  '&[data-state="open"]': {
    outline: 'none',
    backgroundColor: '$grayBgHover',
  },
  ...itemStyles,
  padding: '$2 0',
  '&:focus': {
    outline: 'none',
    backgroundColor: '$grayBgHover',
  },
})

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = styled(DropdownMenuPrimitive.Trigger, {
  backgroundColor: 'transparent',
  border: 0,
  padding: 0,
  marginRight: '$2',
})
const Box = styled('div', {})

const MainContainer = styled(Box, {
  fontFamily: 'inter',
  fontSize: '$2',
  lineHeight: '1.25',
  color: '$grayText',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '$grayBg',
  border: '1px solid $grayBorder',
  width: '180px',
  borderRadius: '$3',
  px: '$3',
  py: '$2',
  cursor: 'pointer',
  '&:hover': {
    border: '1px solid $grayBorderHover',
  },
  '@mdDown': {
    width: '100%'
  }
})

const CustomLabelWrapper = styled(Box, {
  fontSize: 13,
  padding: '$2',
  borderRadius: 3,
  cursor: 'default',
  color: '$grayText',

  '&:focus': {
    outline: 'none',
    backgroundColor: '$grayBgHover',
  },
})

export const LabelColorDropdown = (props: LabelColorDropdownProps) => {
  const {
    isCreateMode,
    canEdit,
    labelColorHexRowId,
    labelId,
    labelColor,
    labelColorHexValue,
    setLabelColorHex,
  } = props

  const isDarkMode = isDarkTheme()
  const iconColor = isDarkMode ? '#FFFFFF': '#0A0806'
  const [open, setOpen] = useState<boolean | undefined>(false);

  const handleCustomColorChange = (color: string) => {
    setLabelColorHex({
      rowId: labelId,
      value: color.toUpperCase() as LabelColor,
    })
  }

  const handleOpen = (open: boolean) => {
    if (canEdit && open) setOpen(true)
    else if((isCreateMode && !canEdit) && open) setOpen(true)
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
            width: 'auto'
          },
        }}
      >
        <MainContainer>
          <SpanBox css={{ paddingRight: '$3' }}>
            {labelId !== '' && labelId === labelColorHexRowId ? (
              <LabelOption
                isCreateMode={isCreateMode}
                labelId={labelId}
                color={labelColorHexValue}
                isDropdownOption={false}
              />
            ) : (
              <>
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
                    color={labelColorHexValue}
                    isDropdownOption={false}
                  />
                )}
              </>
            )}
          </SpanBox>

          <CaretDown size={16} color={iconColor} weight="bold" />
        </MainContainer>
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={5}>
        {Object.keys(labelColorObjects)
          .filter((labelColor) => labelColor !== 'custom color')
          .map((labelColor) => (
            <DropdownOption
              key={labelColor}
              onSelect={() =>
                setLabelColorHex({
                  rowId: labelId,
                  value: labelColor as LabelColor,
                })
              }
            >
              <LabelOption
                isCreateMode={isCreateMode}
                labelId={labelId}
                color={labelColor}
                isDropdownOption
              />
            </DropdownOption>
          ))}
        <DropdownMenu>
          <DropdownMenuTriggerItem>
            <CustomLabelWrapper onSelect={() => null}>
              <LabelOption
                isCreateMode={isCreateMode}
                labelId={labelId}
                color="custom color"
                isDropdownOption
              />
            </CustomLabelWrapper>
          </DropdownMenuTriggerItem>
          <DropdownMenuContent
            sideOffset={-25}
            alignOffset={-5}
            css={{ minWidth: 'unset' }}
          >
            <HexColorPicker
              color={labelColor}
              onChange={handleCustomColorChange}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LabelOption(props: LabelOptionProps): JSX.Element {
  const { color, isDropdownOption, isCreateMode, labelId } = props
  // const colorDetails = getColorDetails(
  //   color as LabelColor,
  //   labelId,
  //   Boolean(isCreateMode)
  // )
  const isCreating = isCreateMode && !labelId
  const textDisplay = !isCreating && !isDropdownOption ? 'none' : 'unset'
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
          display: textDisplay,
          fontSize: '$3',
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
          '@md': {
            display: 'unset',
          },
        }}
      >
        {colorNameText}
      </StyledText>
      <StyledText
        css={{
          m: '$1',
          color: '$grayText',
          display: textDisplay,
          fontSize: '$3',
          whiteSpace: 'nowrap',
          '@md': {
            display: 'unset',
          },
        }}
      >
        {colorNameText === 'custom color' ? '' : colorHex}
      </StyledText>
      {isDropdownOption ? <Box css={{ pr: '$2' }} /> : null}
    </HStack>
  )
  // colorName,
  // color: hexCode,
  // icon: <LabelColorIcon fillColor={fillColor} strokeColor={strokeColor} />,
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
