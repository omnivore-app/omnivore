import { LIBRARY_LEFT_MENU_WIDTH } from '../templates/navMenu/LibraryMenu'
import { theme } from '../tokens/stitches.config'
import { OmnivoreFullLogo } from './images/OmnivoreFullLogo'
import { OmnivoreNameLogo } from './images/OmnivoreNameLogo'
import { SpanBox } from './LayoutPrimitives'

export function LogoBox(): JSX.Element {
  return (
    <>
      <SpanBox
        css={{
          pl: '25px',
          height: '24px',
          pointerEvents: 'all',
          width: LIBRARY_LEFT_MENU_WIDTH,
          minWidth: LIBRARY_LEFT_MENU_WIDTH,
          '@mdDown': {
            display: 'none',
          },
        }}
      >
        <OmnivoreFullLogo
          showTitle={true}
          color={theme.colors.thHighContrast.toString()}
        />
      </SpanBox>
      <SpanBox
        css={{
          ml: '15px',
          mr: '15px',

          display: 'none',

          lineHeight: '1',
          '@mdDown': {
            display: 'flex',
          },
        }}
      >
        <OmnivoreNameLogo color={theme.colors.thHighContrast.toString()} />
      </SpanBox>
    </>
  )
}
