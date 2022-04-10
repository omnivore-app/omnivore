import {
  Separator,
  Item,
  Trigger,
  Content,
  Root,
  TriggerItem,
  Arrow,
  Label,
} from '@radix-ui/react-dropdown-menu'
import { PopperContentProps } from '@radix-ui/react-popover';
import { CSS } from '@stitches/react';
import { styled } from './../tokens/stitches.config'

const itemStyles = {
  fontSize: 13,
  padding: '$2',
  borderRadius: 3,
  cursor: 'default',
  color: '$grayText',

  '&:focus': {
    outline: 'none',
    backgroundColor: '$grayBgHover',
  },
}

const StyledItem = styled(Item, itemStyles)

const DropdownTrigger = styled(Trigger, {
  fontSize: '100%',
  border: 0,
  padding: 0,
  backgroundColor: 'transparent',
  '&:hover': {
    opacity: 0.7,
  },
})

const StyledTriggerItem = styled(TriggerItem, {
  '&[data-state="open"]': {
    outline: 'none',
    backgroundColor: '$grayBgHover',
  },
  ...itemStyles,
})

export const DropdownContent = styled(Content, {
  minWidth: 130,
  backgroundColor: '$grayBg',
  borderRadius: '0.5em',
  padding: 5,
  outline: '1px solid $grayBorder',
  boxShadow: '$cardBoxShadow',
})

const StyledArrow = styled(Arrow, {
  fill: '$grayBg',
})

const StyledLabel = styled(Label, {
  color: '$grayText',
  fontSize: 13,
  padding: '5px 10px',
  cursor: 'default',
})

export type DropdownAlignment = 'start' | 'end' | 'center'
export type DropdownSide = 'top' | 'right' | 'bottom' | 'left'

type DropdownProps = {
  labelText?: string
  showArrow?: boolean
  triggerElement: React.ReactNode
  children: React.ReactNode
  styledArrow?: boolean
  align?: DropdownAlignment
  side?: DropdownSide
  sideOffset?: number
  disabled?: boolean
  css?: CSS
}

export const DropdownSeparator = styled(Separator, {
  height: '1px',
  margin: 0,
  backgroundColor: '$grayBorder',
})

type DropdownOptionProps = {
  onSelect: () => void
  title?: string
  children?: React.ReactNode
  hideSeparator?: boolean
}

export function DropdownOption(props: DropdownOptionProps): JSX.Element {
  return (
    <>
      <StyledItem onSelect={props.onSelect}>
        {props.title ?? props.children}
      </StyledItem>
      {props.hideSeparator ? null : <DropdownSeparator />}
    </>
  )
}

export function Dropdown(props: DropdownProps & PopperContentProps): JSX.Element {
  const {
    children,
    align,
    triggerElement,
    labelText,
    showArrow = true,
    disabled = false,
    side = 'bottom',
    sideOffset = 0,
    alignOffset = 0,
    css
  } = props
  return (
    <Root modal={false}>
      <DropdownTrigger disabled={disabled}>{triggerElement}</DropdownTrigger>
      <DropdownContent
        css={css}
        onInteractOutside={(event) => {
          // remove focus from dropdown
          ;(document.activeElement as HTMLElement).blur()
        }}
        side={side}
        sideOffset={sideOffset}
        align={align ? align : 'center'}
        alignOffset={alignOffset}
      >
        {labelText && <StyledLabel>{labelText}</StyledLabel>}
        {children}
        {showArrow && <StyledArrow offset={20} width={20} height={10} />}
      </DropdownContent>
    </Root>
  )
}

export function NestedDropdown(props: DropdownProps): JSX.Element {
  return (
    <Root>
      <StyledTriggerItem>{props.triggerElement}</StyledTriggerItem>
      <DropdownContent
        sideOffset={12}
        onInteractOutside={() => {
          // remove focus from sub-dropdown
          ;(document.activeElement as HTMLElement).blur()
        }}
      >
        {props.children}
        <StyledArrow offset={13} />
      </DropdownContent>
    </Root>
  )
}
