import { useRouter } from 'next/router'
import { Moon, Sun } from '@phosphor-icons/react'
import { ReactNode, useCallback } from 'react'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { Avatar } from '../elements/Avatar'
import { AvatarDropdown } from '../elements/AvatarDropdown'
import {
  Dropdown,
  DropdownOption,
  DropdownSeparator,
} from '../elements/DropdownElements'
import GridLayoutIcon from '../elements/images/GridLayoutIcon'
import ListLayoutIcon from '../elements/images/ListLayoutIcon'
import { Box, HStack, SpanBox, VStack } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { styled, theme, ThemeId } from '../tokens/stitches.config'
import { LayoutType } from './homeFeed/HomeFeedContainer'
import { useCurrentTheme } from '../../lib/hooks/useCurrentTheme'
import { ThemeSelector } from './article/ReaderSettingsControl'

type PrimaryDropdownProps = {
  children?: ReactNode

  layout?: LayoutType
  updateLayout?: (layout: LayoutType) => void
}

export type HeaderDropdownAction =
  | 'navigate-to-install'
  | 'navigate-to-feeds'
  | 'navigate-to-emails'
  | 'navigate-to-labels'
  | 'navigate-to-rules'
  | 'navigate-to-profile'
  | 'navigate-to-subscriptions'
  | 'navigate-to-api'
  | 'navigate-to-integrations'
  | 'navigate-to-saved-searches'
  | 'increaseFontSize'
  | 'decreaseFontSize'
  | 'logout'

type TriggerButtonProps = {
  name?: string
}

const TriggerButton = (props: TriggerButtonProps): JSX.Element => {
  return (
    <HStack
      css={{
        mx: '10px',
        gap: '10px',
        alignItems: 'center',
        borderRadius: '5px',
        height: '32px',
        px: '10px',
        py: '20px',
        '&:hover': {
          bg: '$thLeftMenuBackground',
          opacity: '0.7px',
        },
      }}
    >
      <AvatarDropdown userInitials={props.name?.charAt(0) ?? 'S'} />

      <SpanBox
        css={{
          display: 'flex',
          justifyContent: 'start',
          fontFamily: '$inter',
          fontSize: '12px',
          maxWidth: '100px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {props.name ?? 'Settings'}
      </SpanBox>
    </HStack>
  )
}

export function PrimaryDropdown(props: PrimaryDropdownProps): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const router = useRouter()

  const headerDropdownActionHandler = useCallback(
    (action: HeaderDropdownAction) => {
      switch (action) {
        case 'navigate-to-install':
          router.push('/settings/installation')
          break
        case 'navigate-to-feeds':
          router.push('/settings/feeds')
          break
        case 'navigate-to-emails':
          router.push('/settings/emails')
          break
        case 'navigate-to-labels':
          router.push('/settings/labels')
          break
        case 'navigate-to-rules':
          router.push('/settings/rules')
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
        case 'navigate-to-saved-searches':
          router.push('/settings/saved-searches')
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

  return (
    <Dropdown
      side="top"
      triggerElement={
        props.children ?? <TriggerButton name={viewerData?.me?.name} />
      }
      css={{ width: '240px', ml: '15px', bg: '$thNavMenuFooter' }}
    >
      <HStack
        alignment="center"
        distribution="start"
        css={{
          width: '100%',
          height: '64px',
          p: '15px',
          gap: '15px',
          cursor: 'pointer',
          mouseEvents: 'all',
        }}
        onClick={(event) => {
          router.push('/settings/account')
          event.preventDefault()
        }}
      >
        <Avatar
          imageURL={viewerData?.me?.profile.pictureUrl}
          height="40px"
          fallbackText={viewerData?.me?.name.charAt(0) ?? ''}
        />
        <VStack
          css={{ height: '40px', maxWidth: '240px' }}
          alignment="start"
          distribution="around"
        >
          {viewerData?.me && (
            <>
              <StyledText
                css={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '$thTextContrast2',
                  m: '0px',
                  p: '0px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {viewerData.me.name}
              </StyledText>
              <StyledText
                css={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#898989',
                  m: '0px',
                  p: '0px',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {`@${viewerData.me.profile.username}`}
              </StyledText>
            </>
          )}
        </VStack>
      </HStack>
      <DropdownSeparator />
      <ThemeSection {...props} />
      <DropdownOption
        onSelect={() => headerDropdownActionHandler('navigate-to-install')}
        title="Install"
      />
      <DropdownOption
        onSelect={() => headerDropdownActionHandler('navigate-to-feeds')}
        title="Feeds"
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
        onSelect={() => headerDropdownActionHandler('navigate-to-rules')}
        title="Rules"
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
      <DropdownSeparator />
      <DropdownOption
        onSelect={() => headerDropdownActionHandler('logout')}
        title="Logout"
      />
    </Dropdown>
  )
}

export const StyledToggleButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$thTextContrast2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  width: '70px',
  height: '100%',
  borderRadius: '5px',
  fontSize: '12px',
  fontFamily: '$inter',
  gap: '5px',
  m: '2px',
  '&:hover': {
    opacity: 0.8,
  },
  '&[data-state="on"]': {
    bg: '$thBackground',
  },
})

const ThemeSection = (props: PrimaryDropdownProps): JSX.Element => {
  const { currentTheme, setCurrentTheme, currentThemeIsDark } =
    useCurrentTheme()

  return (
    <>
      <VStack css={{ width: '100%' }}>
        <ThemeSelector />
      </VStack>
      <DropdownSeparator />
    </>
  )
}

function LegacyMenuThemeSection(props: PrimaryDropdownProps): JSX.Element {
  const { currentTheme, setCurrentTheme, currentThemeIsDark } =
    useCurrentTheme()

  return (
    <>
      <VStack>
        <HStack
          alignment="center"
          css={{
            width: '100%',
            px: '15px',
            justifyContent: 'space-between',
          }}
        >
          <StyledText
            css={{
              fontSize: '14px',
              fontWeight: '400',
              cursor: 'default',
              color: '$utilityTextDefault',
            }}
          >
            Mode
          </StyledText>
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bg: '$thBackground4',
              borderRadius: '5px',
              height: '34px',
              p: '3px',
              px: '1px',
            }}
          >
            <StyledToggleButton
              data-state={!currentThemeIsDark ? 'on' : 'off'}
              onClick={() => {
                setCurrentTheme(ThemeId.Light)
              }}
            >
              Light
              <Sun size={15} color={theme.colors.thTextContrast2.toString()} />
            </StyledToggleButton>
            <StyledToggleButton
              data-state={currentThemeIsDark ? 'on' : 'off'}
              onClick={() => {
                setCurrentTheme(ThemeId.Dark)
              }}
            >
              Dark
              <Moon size={15} color={theme.colors.thTextContrast2.toString()} />
            </StyledToggleButton>
          </Box>
        </HStack>
        {props.layout && (
          <HStack
            alignment="center"
            css={{
              width: '100%',
              px: '15px',
              justifyContent: 'space-between',
            }}
          >
            <StyledText
              css={{
                fontSize: '14px',
                fontWeight: '400',
                cursor: 'default',
                color: '$utilityTextDefault',
              }}
            >
              Layout
            </StyledText>
            <Box
              css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bg: '$thBackground4',
                borderRadius: '5px',
                height: '34px',
                p: '3px',
                px: '1px',
              }}
            >
              <StyledToggleButton
                data-state={props.layout == 'LIST_LAYOUT' ? 'on' : 'off'}
                onClick={() => {
                  props.updateLayout && props.updateLayout('LIST_LAYOUT')
                }}
              >
                <ListLayoutIcon
                  color={theme.colors.thTextContrast2.toString()}
                />
              </StyledToggleButton>
              <StyledToggleButton
                data-state={props.layout == 'GRID_LAYOUT' ? 'on' : 'off'}
                onClick={() => {
                  props.updateLayout && props.updateLayout('GRID_LAYOUT')
                }}
              >
                <GridLayoutIcon
                  color={theme.colors.thTextContrast2.toString()}
                />
              </StyledToggleButton>
            </Box>
          </HStack>
        )}
      </VStack>
      <DropdownSeparator />
    </>
  )
}
