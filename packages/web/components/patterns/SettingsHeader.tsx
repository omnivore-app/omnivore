import { HStack } from '../elements/LayoutPrimitives'
import { UserBasicData } from '../../lib/networking/queries/useGetViewerQuery'
import { DEFAULT_HEADER_HEIGHT } from '../templates/homeFeed/HeaderSpacer'
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
          height: DEFAULT_HEADER_HEIGHT,
          '@mdDown': {
            pr: '15px',
          },
          bg: '$thBackground',
        }}
      >
        <LogoBox />
      </HStack>
    </nav>
  )
}
