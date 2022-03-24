import { ReactNode, useMemo, useState } from 'react'
import { Box, HStack, VStack } from './../elements/LayoutPrimitives'
import {
  Dropdown,
  DropdownSeparator,
  DropdownOption,
} from '../elements/DropdownElements'
import { StyledText } from '../elements/StyledText'
import { Button } from '../elements/Button'
import { currentThemeName } from '../../lib/themeUpdater'

export type HeaderDropdownAction =
  | 'apply-darker-theme'
  | 'apply-dark-theme'
  | 'apply-light-theme'
  | 'apply-lighter-theme'
  | 'navigate-to-install'
  | 'navigate-to-feedback'
  | 'navigate-to-profile'
  | 'increaseFontSize'
  | 'decreaseFontSize'
  | 'logout'

type DropdownMenuProps = {
  username?: string
  triggerElement: ReactNode
  displayFontStepper?: boolean
  actionHandler: (action: HeaderDropdownAction) => void
}

export function DropdownMenu(props: DropdownMenuProps): JSX.Element {
  const [currentTheme, setCurrentTheme] = useState(currentThemeName())

  const isDark = useMemo(() => {
    return currentTheme === 'Dark' || currentTheme === 'Darker'
  }, [currentTheme])

  return (
    <Dropdown triggerElement={props.triggerElement}>
      <VStack css={{ p: '$2' }}>
        <StyledText style='menuTitle'>Theme</StyledText>
        <HStack css={{ mt: '6px', mb: '6px', width: '100%', gap: '8px' }}>
          <Button style='themeSwitch' css={{ background: "#FFFFFF", width: '50%' }} onClick={() => {
            props.actionHandler('apply-lighter-theme')
            setCurrentTheme(currentThemeName())
          }}>
            { isDark ? '' : '✓' }
          </Button>
          <Button style='themeSwitch' css={{ background: "#3D3D3D", width: '50%' }} onClick={() => {
            props.actionHandler('apply-dark-theme')
            setCurrentTheme(currentThemeName())
          }}>
            { isDark ? '✓' : '' }
          </Button>
        </HStack>

        {props.displayFontStepper && (
          <>
          <HStack css={{ mt: '8px', width: '100%', height: '26px', gap: '8px', borderRadius: '6px', border: '1px solid $grayTextContrast', }}>
            <Button style='plainIcon' css={{ display: 'inline-block', verticalAlign: 'baseline', width: '50%', height: '100%', bg: 'unset' }} onClick={() => {
              props.actionHandler('decreaseFontSize')
            }}>
              <StyledText css={{ fontSize: '14px', m: '0px' }}>A</StyledText>
            </Button>
            <Box css={{ width: '1px', height: '100%', bg: '$grayTextContrast' }} />
            <Button style='plainIcon' css={{ display: 'inline-block', verticalAlign: 'baseline', width: '50%', height: '100%', bg: 'unset' }} onClick={() => {
              props.actionHandler('increaseFontSize')
            }}>
              <StyledText css={{ fontSize: '18px', m: '0px'  }}>A</StyledText>
            </Button>
          </HStack>
          </>
        )}
      </VStack>
      <DropdownSeparator />
      <DropdownOption
        onSelect={() => props.actionHandler('navigate-to-install')}
        title="Install"
      />
      <DropdownOption
        onSelect={() => window.Intercom('show')}
        title="Feedback"
      />
      <DropdownOption
        onSelect={() => props.actionHandler('logout')}
        title="Logout"
        hideSeparator
      />
    </Dropdown>
  )
}
