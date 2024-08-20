import { HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { SplitButton } from '../../elements/SplitButton'
import { PrimaryDropdown } from '../PrimaryDropdown'
import { LIBRARY_LEFT_MENU_WIDTH } from './LibraryMenu'

type NavMenuFooterProps = {
  showFullThemeSection?: boolean
  setShowAddLinkModal?: (show: true) => void
}

export const NavMenuFooter = (props: NavMenuFooterProps): JSX.Element => {
  return (
    <HStack
      css={{
        gap: '10px',
        height: '65px',
        position: 'fixed',
        bottom: '0%',
        alignItems: 'center',
        bg: '$thNavMenuFooter',
        width: LIBRARY_LEFT_MENU_WIDTH,
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }}
    >
      <PrimaryDropdown />
      <SpanBox
        css={{
          marginLeft: 'auto',
          marginRight: '15px',
        }}
      >
        {props.setShowAddLinkModal && (
          <SplitButton
            title="Add"
            setShowLinkMode={() => {
              props.setShowAddLinkModal && props.setShowAddLinkModal(true)
            }}
          />
        )}
      </SpanBox>
    </HStack>
  )
}
