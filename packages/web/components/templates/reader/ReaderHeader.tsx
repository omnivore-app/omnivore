import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { PrimaryDropdown } from '../PrimaryDropdown'
import { LogoBox } from '../../elements/LogoBox'
import { ReactNode } from 'react'
import { useGetHeaderHeight } from '../homeFeed/HeaderSpacer'
import { theme } from '../../tokens/stitches.config'
import { ReaderSettingsIcon } from '../../elements/icons/ReaderSettingsIcon'
import { CircleUtilityMenuIcon } from '../../elements/icons/CircleUtilityMenuIcon'

type ReaderHeaderProps = {
  alwaysDisplayToolbar: boolean
  hideDisplaySettings: boolean
  showDisplaySettingsModal: (show: boolean) => void
  children?: ReactNode
}

export function ReaderHeader(props: ReaderHeaderProps): JSX.Element {
  const headerHeight = useGetHeaderHeight()
  return (
    <>
      <VStack
        alignment="center"
        distribution="start"
        css={{
          top: '0',
          left: '0',
          zIndex: 1,
          pt: '0px',
          position: 'fixed',
          width: '100%',
          height: headerHeight,
          display: props.alwaysDisplayToolbar ? 'flex' : 'transparent',
          pointerEvents: props.alwaysDisplayToolbar ? 'unset' : 'none',
          borderBottom: '1px solid transparent',
          '@xlgDown': {
            bg: '$readerBg',
            pointerEvents: 'unset',
          },
          '@mdDown': {
            bg: '$readerBg',
            pointerEvents: 'unset',
          },
          '@media print': {
            display: 'none',
          },
        }}
      >
        <HStack
          alignment="center"
          distribution="start"
          css={{
            width: '100%',
            height: '100%',
          }}
        >
          <LogoBox />
          <SpanBox
            css={{
              width: '100%',
              px: '25px',
              '@lg': {
                display: props.alwaysDisplayToolbar ? 'flex' : 'none',
              },
              '@mdDown': { px: '15px' },
            }}
          >
            {props.children}
          </SpanBox>
          {!props.alwaysDisplayToolbar && !props.hideDisplaySettings && (
            <SpanBox
              css={{
                width: '100%',
                '@lgDown': {
                  display: 'none',
                },
              }}
            >
              <ControlButtonBox {...props} />
            </SpanBox>
          )}
        </HStack>
      </VStack>
    </>
  )
}

function ControlButtonBox(props: ReaderHeaderProps): JSX.Element {
  return (
    <>
      <HStack
        alignment="center"
        distribution="end"
        css={{
          marginLeft: 'auto',
          marginRight: '25px',
          width: '100px',
          height: '100%',
          gap: '20px',
          minWidth: '121px',
          pointerEvents: 'all',
        }}
      >
        <Button
          title="Reader preferences (d)"
          style="articleActionIcon"
          onClick={() => {
            props.showDisplaySettingsModal(true)
          }}
        >
          <ReaderSettingsIcon
            size={25}
            color={theme.colors.thHighContrast.toString()}
          />
        </Button>
        <PrimaryDropdown showThemeSection={false}>
          <CircleUtilityMenuIcon
            size={25}
            color={theme.colors.thHighContrast.toString()}
          />
        </PrimaryDropdown>
      </HStack>
    </>
  )
}
