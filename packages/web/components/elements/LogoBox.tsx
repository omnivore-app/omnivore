import { LIBRARY_LEFT_MENU_WIDTH } from '../templates/homeFeed/LibraryFilterMenu'
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
          width: LIBRARY_LEFT_MENU_WIDTH,
          minWidth: LIBRARY_LEFT_MENU_WIDTH,
          '@mdDown': {
            display: 'none',
          },
        }}
      >
        <OmnivoreFullLogo showTitle={true} />
      </SpanBox>
      <SpanBox
        css={{
          ml: '20px',
          mr: '20px',
          '@md': {
            display: 'none',
          },
        }}
      >
        <OmnivoreNameLogo />
      </SpanBox>
    </>
  )
}
