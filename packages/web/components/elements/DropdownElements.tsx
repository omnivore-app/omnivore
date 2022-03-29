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

const DropdownContent = styled(Content, {
  minWidth: 130,
  backgroundColor: '$grayBg',
  borderRadius: '0.5em',
  padding: 5,
  border: '1px solid $grayBorder',
  boxShadow: '$cardBoxShadow',
})

const StyledArrow = styled(Arrow, {
  fill: '$grayBase',
})

const StyledLabel = styled(Label, {
  color: '$grayText',
  fontSize: 13,
  padding: '5px 10px',
  cursor: 'default',
})

export type DropdownAlignment = 'start' | 'end' | 'center'

type DropdownProps = {
  labelText?: string
  showArrow?: boolean
  triggerElement: React.ReactNode
  children: React.ReactNode
  align?: DropdownAlignment
}

export const DropdownSeparator = styled(Separator, {
  height: 0,
  margin: 0,
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

export function Dropdown({
  children,
  align,
  triggerElement,
  labelText,
  showArrow = true,
}: DropdownProps): JSX.Element {
  return (
    <Root modal={false}>
      <DropdownTrigger>{triggerElement}</DropdownTrigger>
      <DropdownContent
        onInteractOutside={() => {
          // remove focus from dropdown
          ;(document.activeElement as HTMLElement).blur()
        }}
        align={align ? align : 'center'}
      >
        {labelText && <StyledLabel>{labelText}</StyledLabel>}
        {children}
        {showArrow && <StyledArrow offset={20} />}
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
