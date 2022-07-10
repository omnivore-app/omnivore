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
  fontSize: '16px',
  fontWeight: 'semibold',
  py: '12px',
  px: '24px',
  borderRadius: 3,
  cursor: 'default',
  color: '$utilityTextDefault',

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
  width: 195,
  backgroundColor: '$grayBg',
  borderRadius: '6px',
  outline: '1px solid #323232',
  border: '1px solid $grayBorder',
  boxShadow: '$cardBoxShadow',
  '--arrow-visibility': '',
  '&[data-side="top"]': {
    '--arrow-visibility': 'collapse',
  },
  '&[data-side="bottom"]': {
    '--arrow-top': -13,
  },
  '&[data-align="start"]': {
    '--arrow-before-left': '9px',
    '--arrow-before-right': 'auto',
    '--arrow-after-left': '10px',
    '--arrow-after-right': 'auto',
  },
  '&[data-align="center"]': {
    '--arrow-before-left': 'auto',
    '--arrow-before-right': '90px',
    '--arrow-after-left': 'auto',
    '--arrow-after-right': '91px',
  },
  '&[data-align="end"]': {
    '--arrow-before-left': 'auto',
    '--arrow-before-right': '9px',
    '--arrow-after-left': 'auto',
    '--arrow-after-right': '10px',
  },
  '&:before': {
    top: 'calc(var(--arrow-top) * 1px - 2px)',
    left: 'var(--arrow-before-left)',
    right: 'var(--arrow-before-right)',
    border: '8px solid transparent',
    borderBottomColor: '$grayBorder',
  },
  '&:after': {
    top: 'calc(var(--arrow-top) * 1px)',
    left: 'var(--arrow-after-left)',
    right: 'var(--arrow-after-right)',
    border: '7px solid transparent',
    borderBottomColor: '$grayBg',
  },
  '&:before, &:after': {
    visibility: 'var(--arrow-visibility)',
    position: 'absolute',
    display: 'inline-block',
    content: '',
  },
})

const StyledArrow = styled(Arrow, {
  visibility: 'hidden',
})

const StyledLabel = styled(Label, {
  color: '$utilityTextDefault',
  fontSize: 13,
  padding: '5px 10px',
  cursor: 'default',
})

export type DropdownAlignment = 'start' | 'end' | 'center'
export type DropdownSide = 'top' | 'right' | 'bottom' | 'left'

type DropdownProps = {
  labelText?: string
  triggerElement: React.ReactNode
  children: React.ReactNode
  styledArrow?: boolean
  align?: DropdownAlignment
  side?: DropdownSide
  sideOffset?: number
  disabled?: boolean
  css?: CSS
  modal?: boolean
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
    </>
  )
}

export function Dropdown(props: DropdownProps & PopperContentProps): JSX.Element {
  const {
    children,
    align,
    triggerElement,
    labelText,
    disabled = false,
    side = 'bottom',
    sideOffset = 0,
    alignOffset = 0,
    css,
    modal
  } = props
  return (
    <Root modal={modal}>
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
        <StyledArrow />
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
