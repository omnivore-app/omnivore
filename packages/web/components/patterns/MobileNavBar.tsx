import { HStack, VStack } from '../elements/LayoutPrimitives'
import { useRouter } from 'next/router'
import { StyledText } from '../elements/StyledText'
import { Gear, MagnifyingGlass, Newspaper, UserCircle } from 'phosphor-react'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import { styled } from '../tokens/stitches.config'
import { isDarkTheme } from '../../lib/themeUpdater'

export type MobileNavBarAction =
  | 'navigate-to-library'
  | 'navigate-to-profile'
  | 'navigate-to-settings'

type MobileNavBarProps = {
  user?: UserBasicData
}

const textStyles = {
  mt: 6.5,
  fontSize: 11,
}

const NavIconContainer = styled(VStack, {
  cursor: 'pointer',
})

const MobileNav = styled(HStack, {
  display: 'none',
  height: 83,
  position: 'fixed',
  bottom: 0,
  width: '100%',
  bg: '$grayBase',
  pt: 13.5,
  border: '0.5px solid $grayBorder',
  '@smDown': {
    display: 'flex',
  }
})

export function MobileNavBar(props: MobileNavBarProps): JSX.Element {
  const router = useRouter()
  const iconColor = isDarkTheme() ? 'white' : 'black'

  function mobileNavBarActionHandler(action: MobileNavBarAction): void {
    switch (action) {
      case 'navigate-to-library':
        router.push('/home')
        break
      case 'navigate-to-profile':
        if (props.user) {
          router.push(`/${props.user.profile.username}`)
        }
        break
      case 'navigate-to-settings':
        router.push('/settings')
        break
      default:
        break
    }
  }

  return (
    <MobileNav>
      <NavIconContainer alignment='center' onClick={() => mobileNavBarActionHandler('navigate-to-library')}>
        <Newspaper color={iconColor} size={24} />
        <StyledText css={textStyles}>Library</StyledText>
      </NavIconContainer>
      <NavIconContainer alignment='center' onClick={() => mobileNavBarActionHandler('navigate-to-profile')}>
        <UserCircle color={iconColor} size={24} />
        <StyledText css={textStyles}>Profile</StyledText>
      </NavIconContainer>
      <NavIconContainer alignment='center'>
        <MagnifyingGlass color={iconColor} size={24} />
        <StyledText css={textStyles}>Search</StyledText>
      </NavIconContainer>
      <NavIconContainer alignment='center' onClick={() => mobileNavBarActionHandler('navigate-to-settings')}>
        <Gear color={iconColor} size={24} />
        <StyledText css={textStyles}>Settings</StyledText>
      </NavIconContainer>
    </MobileNav>
  )
}
