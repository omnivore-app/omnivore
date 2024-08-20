import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { LogoBox } from '../../elements/LogoBox'
import { ReactNode, useEffect, useState } from 'react'
import { DEFAULT_HEADER_HEIGHT } from '../homeFeed/HeaderSpacer'
import { theme } from '../../tokens/stitches.config'
import { ReaderSettingsIcon } from '../../elements/icons/ReaderSettingsIcon'

function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState('up')

  useEffect(() => {
    let lastScrollY = window.pageYOffset

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction)
      }
      lastScrollY = scrollY > 0 ? scrollY : 0
    }
    window.addEventListener('scroll', updateScrollDirection) // add event listener
    return () => {
      window.removeEventListener('scroll', updateScrollDirection) // clean up
    }
  }, [scrollDirection])

  return scrollDirection
}

type ReaderHeaderProps = {
  alwaysDisplayToolbar: boolean
  hideDisplaySettings: boolean
  showDisplaySettingsModal: (show: boolean) => void
  children?: ReactNode
}

export function ReaderHeader(props: ReaderHeaderProps): JSX.Element {
  const scrollDirection = useScrollDirection()
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
          pb: '15px',
          position: 'fixed',
          width: '100%',
          height: DEFAULT_HEADER_HEIGHT,
          display: props.alwaysDisplayToolbar ? 'flex' : 'transparent',
          pointerEvents: props.alwaysDisplayToolbar ? 'unset' : 'none',
          borderBottom: '1px solid transparent',
          '@xlgDown': {
            bg: '$readerBg',
            pointerEvents: 'unset',
          },
          '@mdDown': {
            top: scrollDirection === 'down' ? '-90px' : '0',
            bg: '$readerBg',
            pointerEvents: 'unset',
            transitionProperty: 'top',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDuration: '200ms',
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
      </HStack>
    </>
  )
}
