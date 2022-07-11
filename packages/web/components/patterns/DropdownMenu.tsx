import { ReactNode, useMemo, useState } from 'react'
import { HStack, VStack } from './../elements/LayoutPrimitives'
import {
  Dropdown,
  DropdownOption,
  DropdownSeparator,
} from '../elements/DropdownElements'
import { StyledText } from '../elements/StyledText'
import { Button } from '../elements/Button'
import { currentThemeName } from '../../lib/themeUpdater'
import { Check } from 'phosphor-react'

export type HeaderDropdownAction =
  | 'apply-darker-theme'
  | 'apply-dark-theme'
  | 'apply-light-theme'
  | 'apply-lighter-theme'
  | 'navigate-to-install'
  | 'navigate-to-emails'
  | 'navigate-to-labels'
  | 'navigate-to-profile'
  | 'navigate-to-subscriptions'
  | 'navigate-to-api'
  | 'increaseFontSize'
  | 'decreaseFontSize'
  | 'logout'

type DropdownMenuProps = {
  username?: string
  triggerElement: ReactNode
  actionHandler: (action: HeaderDropdownAction) => void
}

export function DropdownMenu(props: DropdownMenuProps): JSX.Element {
  const [currentTheme, setCurrentTheme] = useState(currentThemeName())

  const isDark = useMemo(() => {
    return currentTheme === 'Dark' || currentTheme === 'Darker'
  }, [currentTheme])

  return (
    <Dropdown triggerElement={props.triggerElement}>
      <VStack css={{ py: '12px', px: '24px' }}>
        <StyledText style="menuTitle">Theme</StyledText>
        <HStack css={{ py: '8px', width: '100%', gap: '25px' }}>
          <Button
            style="themeSwitch"
            css={{ background: '#FFFFFF' }}
            data-state={isDark ? 'unselected' : 'selected' }
            onClick={() => {
              props.actionHandler('apply-lighter-theme')
              setCurrentTheme(currentThemeName())
            }}
          >
            {!isDark && (
              <Check color='#F9D354' size={32} />
            )}
          </Button>
          <Button
            style="themeSwitch"
            css={{ background: '#3D3D3D' }}
            data-state={isDark ? 'selected' : 'unselected' }
            onClick={() => {
              props.actionHandler('apply-dark-theme')
              setCurrentTheme(currentThemeName())
            }}
          >
            {isDark && (
              <Check color='#F9D354' size={32} />
            )}
          </Button>
        </HStack>
      </VStack>
      <DropdownOption
        onSelect={() => props.actionHandler('navigate-to-install')}
        title="Install"
      />
      <DropdownOption
        onSelect={() => props.actionHandler('navigate-to-emails')}
        title="Emails"
      />
      <DropdownOption
        onSelect={() => props.actionHandler('navigate-to-labels')}
        title="Labels"
      />
      <DropdownOption
        onSelect={() => props.actionHandler('navigate-to-api')}
        title="API Keys"
      />
      <DropdownOption
        onSelect={() => window.Intercom('show')}
        title="Feedback"
      />
      <DropdownOption
        onSelect={() => props.actionHandler('logout')}
        title="Logout"
      />
    </Dropdown>
  )
}
