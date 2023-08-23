import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { LogoBox } from '../../elements/LogoBox'
import { MutableRefObject, ReactNode } from 'react'
import { HEADER_HEIGHT } from '../homeFeed/HeaderSpacer'
import { theme } from '../../tokens/stitches.config'
import { LeftPanelToggleIcon } from '../../elements/icons/LeftPanelToggleIcon'

type ReaderHeaderProps = {
  alwaysDisplayToolbar: boolean
  showDisplaySettingsModal: (show: boolean) => void

  showInspectorToggle: boolean
  inspectorToggleClicked: (event: React.MouseEvent<HTMLElement>) => void

  containerRef?: MutableRefObject<HTMLDivElement | null>

  children?: ReactNode
}

export function ReaderHeader(props: ReaderHeaderProps): JSX.Element {
  return (
    <>
      <VStack
        alignment="center"
        distribution="start"
        css={{
          position: 'sticky',
          top: `0px`, // scrollDirection == 'down' ? `-${HEADER_HEIGHT}` : `0px`,
          width: '100%',
          minHeight: HEADER_HEIGHT,

          display: props.alwaysDisplayToolbar ? 'flex' : 'transparent',
          pointerEvents: props.alwaysDisplayToolbar ? 'unset' : 'none',
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
              px: '15px',
              '@lg': {
                display: props.alwaysDisplayToolbar ? 'flex' : 'none',
              },
              '@mdDown': { px: '15px' },
            }}
          >
            {props.children}
          </SpanBox>
          {!props.alwaysDisplayToolbar && (
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
          marginRight: '15px',
          width: '100px',
          // height: '100%',
          gap: '20px',
          minWidth: '121px',
          pointerEvents: 'all',
        }}
      >
        {props.showInspectorToggle && (
          <Button
            title="Toggle Inspector"
            style="articleActionIcon"
            onClick={props.inspectorToggleClicked}
          >
            <LeftPanelToggleIcon
              size={25}
              color={theme.colors.thNotebookSubtle.toString()}
            />
          </Button>
        )}
      </HStack>
    </>
  )
}
