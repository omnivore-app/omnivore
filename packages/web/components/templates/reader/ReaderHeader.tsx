import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { DotsThreeOutline, TextAa } from 'phosphor-react'
import { PrimaryDropdown } from '../PrimaryDropdown'
import { TooltipWrapped } from '../../elements/Tooltip'
import { LogoBox } from '../../elements/LogoBox'
import { ReactNode } from 'react'
import { HEADER_HEIGHT } from '../homeFeed/HeaderSpacer'
import { theme } from '../../tokens/stitches.config'

type ReaderHeaderProps = {
  alwaysDisplayToolbar: boolean
  hideDisplaySettings: boolean
  showDisplaySettingsModal: (show: boolean) => void
  children?: ReactNode
}

export function ReaderHeader(props: ReaderHeaderProps): JSX.Element {
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
          height: HEADER_HEIGHT,
          display: props.alwaysDisplayToolbar ? 'flex' : 'transparent',
          pointerEvents: props.alwaysDisplayToolbar ? 'unset' : 'none',
          borderBottom: props.alwaysDisplayToolbar
            ? '1px solid $thBorderColor'
            : '1px solid transparent',
          '@xlgDown': {
            bg: '$readerMargin',
            pointerEvents: 'unset',
            borderBottom: '1px solid $thBorderColor',
          },
          '@mdDown': {
            bg: '$readerBg',
            pointerEvents: 'unset',
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
          style="articleActionIcon"
          onClick={() => {
            props.showDisplaySettingsModal(true)
          }}
        >
          <TooltipWrapped tooltipContent="Reader Preferences (d)">
            <TextAa size={25} color={theme.colors.thHighContrast.toString()} />
          </TooltipWrapped>
        </Button>
        <PrimaryDropdown showThemeSection={false}>
          <DotsThreeOutline
            size={25}
            color={theme.colors.thHighContrast.toString()}
          />
        </PrimaryDropdown>
      </HStack>
    </>
  )
}
