import { Box, HStack } from '../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import { PrimaryDropdown } from '../templates/PrimaryDropdown'
import { HEADER_HEIGHT } from '../templates/homeFeed/HeaderSpacer'
import { LogoBox } from '../elements/LogoBox'

type HeaderProps = {
  user?: UserBasicData
}

export function SettingsHeader(props: HeaderProps): JSX.Element {
  return (
    <nav>
      <HStack
        alignment="center"
        distribution="start"
        css={{
          top: '0',
          left: '0',
          zIndex: 1,
          display: 'flex',
          position: 'fixed',
          width: '100%',
          pr: '25px',
          height: HEADER_HEIGHT,
          '@mdDown': {
            pr: '15px',
          },
          bg: '$thBackground',
        }}
      >
        <LogoBox />
        <HStack css={{ ml: 'auto' }}>
          <PrimaryDropdown showThemeSection={true} />
        </HStack>
      </HStack>
    </nav>
  )
}
