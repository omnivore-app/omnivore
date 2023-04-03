import { Box, HStack, VStack } from '../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import { PrimaryDropdown } from '../templates/PrimaryDropdown'
import {
  HEADER_HEIGHT,
  MOBILE_HEADER_HEIGHT,
} from '../templates/homeFeed/HeaderSpacer'

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
          px: '25px',
          height: MOBILE_HEADER_HEIGHT,
          bg: '$thBackground3',
          borderBottom: '1px solid $thBorderColor',
          '@mdDown': {
            px: '15px',
          },
        }}
      >
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: '10px',
          }}
        >
          <OmnivoreNameLogo href={props.user ? '/home' : '/login'} />
        </Box>

        <HStack css={{ ml: 'auto' }}>
          <PrimaryDropdown showThemeSection={true} />
        </HStack>
      </HStack>
    </nav>
  )
}
