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
      <VStack css={{ p: '$2' }}>
        <StyledText style="menuTitle">Theme</StyledText>
        <HStack css={{ mt: '6px', mb: '6px', width: '100%', gap: '8px' }}>
          <Button
            style="themeSwitch"
            css={{ background: '#FFFFFF', width: '50%' }}
            onClick={() => {
              props.actionHandler('apply-lighter-theme')
              setCurrentTheme(currentThemeName())
            }}
          >
            {isDark ? '' : '✓'}
          </Button>
          <Button
            style="themeSwitch"
            css={{ background: '#3D3D3D', width: '50%' }}
            onClick={() => {
              props.actionHandler('apply-dark-theme')
              setCurrentTheme(currentThemeName())
            }}
          >
            {isDark ? '✓' : ''}
          </Button>
        </HStack>
      </VStack>
      <DropdownSeparator />
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
      {/* <DropdownOption
        onSelect={() => props.actionHandler('navigate-to-subscriptions')}
        title="Subscriptions"
      /> */}
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
