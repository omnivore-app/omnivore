import { VStack, Box, HStack } from '../elements/LayoutPrimitives'
import { useRouter } from 'next/router'
import { StyledText } from '../elements/StyledText'
import { CaretRight } from 'phosphor-react'

export type Selected =
  | 'Apps and Extensions'
  | 'Labels'
  | 'Emails'
  | 'Settings'

export type SettingsMenuAction =
  | 'navigate-to-extensions'
  | 'navigate-to-emails'
  | 'navigate-to-labels'
  | 'navigate-to-settings'

type SettingsMenuProps = {
  selected?: Selected,
}

interface MenuItemProps extends SettingsMenuProps {
  onClick: () => void,
  label: Selected,
  showSeperator?: boolean,
}

const displayStyles = {
  display: 'none',
  "@smDown": {
    display: 'block'
  }
}

const itemBorder = {
  ...displayStyles,
  borderBottom: '1px solid $grayBorder',
  width: '100%',
  paddingTop: 10,
}

const itemStyles = {
  padding: 5,
  pb: 10,
  width: '100%',
  pt: 10,

  '@smDown': {
    mt: 0,
    px: 0,
    pb: 0,
    pt: 10,
  }
}

const selectedStyles = {
  ...itemStyles,
  bg: '$selectedMenuItemBg',
}

const textStyles = {
  fontSize: 16,
  cursor: 'pointer',

  "@smDown": {
    fontSize: 18,
  }
}

const selectedTextStyles = {
  fontWeight: 600,
  fontSize: 16,
  cursor: 'default',

  "@smDown": {
    fontSize: 18,
  }
}

const menuContainerStyles = {
  gap: "$3",
  width: 283,
  bg: '$grayBg',
  py: '$2',
  boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
  borderRadius: 6,
  "@smDown": {
    width: '100%',
    gap: 0,
    pt: 0,
  }
}

const isSelected = (selected?: Selected, value?:Selected) => {
  if (selected === value) return true;
  else return false
}

export function MenuItem(props: MenuItemProps): JSX.Element {
  const selected = isSelected(props.selected, props.label)
  
  return (
    <Box css={selected ? selectedStyles : itemStyles}>
      <HStack distribution='between' alignment='center' css={{px: '$2'}}>
        <StyledText
          style={'menuTitle'}
          onClick={props.onClick}
          css={selected ? selectedTextStyles : textStyles}
        >
          {props.label}
        </StyledText>
        <Box css={displayStyles}>
          <CaretRight size={16} />
        </Box>
      </HStack>
      {props.showSeperator && <Box css={itemBorder} />}
    </Box>
  )
}

export function SettingsMenu(props: SettingsMenuProps): JSX.Element {
  const router = useRouter()

  function settingsMenuActionHandler(action: SettingsMenuAction): void {
    switch (action) {
      case 'navigate-to-extensions':
        router.push('/settings/installation')
        break
      case 'navigate-to-emails':
        router.push('/settings/emails')
        break
      case 'navigate-to-labels':
        router.push('/settings/labels')
        break
      case 'navigate-to-settings':
          router.push('/settings')
        break
      default:
        break
    }
  }

  return (
    <>
      <VStack css={menuContainerStyles}>
        <MenuItem
          showSeperator
          label='Apps and Extensions'
          selected={props.selected}
          onClick={() => {settingsMenuActionHandler('navigate-to-extensions')}}
        />
        <MenuItem
          showSeperator
          label='Labels'
          selected={props.selected}
          onClick={() => {settingsMenuActionHandler('navigate-to-labels')}}
        />
        <MenuItem
          showSeperator
          label='Emails'
          selected={props.selected}
          onClick={() => {settingsMenuActionHandler('navigate-to-emails')}}
        />
        <MenuItem
          label='Settings'
          selected={props.selected}
          onClick={() => {settingsMenuActionHandler('navigate-to-settings')}}
        />
      </VStack>
    </>
  )
}
