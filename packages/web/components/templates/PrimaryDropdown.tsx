import { useRouter } from 'next/router'
import { Check } from 'phosphor-react'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { currentThemeName, updateTheme } from '../../lib/themeUpdater'
import { AvatarDropdown } from '../elements/AvatarDropdown'
import { Button } from '../elements/Button'
import { Dropdown, DropdownOption } from '../elements/DropdownElements'
import { HStack, VStack } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { DropdownMenu } from '../patterns/DropdownMenu'
import { ThemeId } from '../tokens/stitches.config'

type PrimaryDropdownProps = {
  children?: ReactNode
  showThemeSection: boolean
}

export type HeaderDropdownAction =
  | 'navigate-to-install'
  | 'navigate-to-emails'
  | 'navigate-to-labels'
  | 'navigate-to-profile'
  | 'navigate-to-subscriptions'
  | 'navigate-to-api'
  | 'navigate-to-integrations'
  | 'increaseFontSize'
  | 'decreaseFontSize'
  | 'logout'

export function PrimaryDropdown(props: PrimaryDropdownProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const router = useRouter()

  const [currentTheme, setCurrentTheme] = useState(currentThemeName())

  const isDark = useMemo(() => {
    return currentTheme === 'Dark' || currentTheme === 'Darker'
  }, [currentTheme])

  const headerDropdownActionHandler = useCallback(
    (action: HeaderDropdownAction) => {
      switch (action) {
        case 'navigate-to-install':
          router.push('/settings/installation')
          break
        case 'navigate-to-emails':
          router.push('/settings/emails')
          break
        case 'navigate-to-labels':
          router.push('/settings/labels')
          break
        case 'navigate-to-subscriptions':
          router.push('/settings/subscriptions')
          break
        case 'navigate-to-api':
          router.push('/settings/api')
          break
        case 'navigate-to-integrations':
          router.push('/settings/integrations')
          break
        case 'logout':
          document.dispatchEvent(new Event('logout'))
          break
        default:
          break
      }
    },
    [router]
  )

  if (!viewerData?.me) {
    return <></>
  }

  return (
    <Dropdown
      triggerElement={
        props.children ?? (
          <AvatarDropdown userInitials={viewerData?.me?.name.charAt(0) ?? ''} />
        )
      }
    >
      {props.showThemeSection && (
        <VStack css={{ py: '12px', px: '24px' }}>
          <ThemeSection />
        </VStack>
      )}
      <DropdownOption
        onSelect={() => headerDropdownActionHandler('navigate-to-install')}
        title="Install"
      />
      <DropdownOption
        onSelect={() => headerDropdownActionHandler('navigate-to-emails')}
        title="Emails"
      />
      <DropdownOption
        onSelect={() => headerDropdownActionHandler('navigate-to-labels')}
        title="Labels"
      />
      <DropdownOption
        onSelect={() => headerDropdownActionHandler('navigate-to-api')}
        title="API Keys"
      />
      <DropdownOption
        onSelect={() => headerDropdownActionHandler('navigate-to-integrations')}
        title="Integrations"
      />
      <DropdownOption
        onSelect={() => window.open('https://docs.omnivore.app', '_blank')}
        title="Documentation"
      />
      <DropdownOption
        onSelect={() => window.Intercom('show')}
        title="Feedback"
      />
      <DropdownOption
        onSelect={() => headerDropdownActionHandler('logout')}
        title="Logout"
      />
    </Dropdown>
  )
}

function ThemeSection(): JSX.Element {
  const [currentTheme, setCurrentTheme] = useState(currentThemeName())

  const isDark = useMemo(() => {
    return currentTheme === 'Dark' || currentTheme === 'Darker'
  }, [currentTheme])

  return (
    <>
      <StyledText style="menuTitle">Theme</StyledText>
      <HStack css={{ py: '8px', width: '100%', gap: '25px' }}>
        <Button
          style="themeSwitch"
          css={{ background: '#FFFFFF' }}
          data-state={isDark ? 'unselected' : 'selected'}
          onClick={() => {
            updateTheme(ThemeId.Lighter)
            setCurrentTheme(currentThemeName())
          }}
        >
          {!isDark && <Check color="#F9D354" size={32} />}
        </Button>
        <Button
          style="themeSwitch"
          css={{ background: '#3D3D3D' }}
          data-state={isDark ? 'selected' : 'unselected'}
          onClick={() => {
            updateTheme(ThemeId.Dark)
            setCurrentTheme(currentThemeName())
          }}
        >
          {isDark && <Check color="#F9D354" size={32} />}
        </Button>
      </HStack>
    </>
  )
}
