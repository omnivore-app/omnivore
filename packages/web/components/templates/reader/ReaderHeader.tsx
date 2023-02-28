import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { DotsThreeOutline, TextAa } from 'phosphor-react'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'
import { OmnivoreFullLogo } from '../../elements/images/OmnivoreFullLogo'
import { PrimaryDropdown } from '../PrimaryDropdown'
import { TooltipWrapped } from '../../elements/Tooltip'
import { ReaderSettings } from '../../../lib/hooks/useReaderSettings'

const HEADER_HEIGHT = '105px'
const MOBILE_HEIGHT = '48px'

type ReaderHeaderProps = {
  showDisplaySettingsModal: (show: boolean) => void
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
          zIndex: 5,
          position: 'fixed',
          width: '100%',
          height: HEADER_HEIGHT,
          bg: 'transparent',
          pt: '35px',
          '@mdDown': {
            height: MOBILE_HEIGHT,
            pt: '0px',
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
          <ControlButtonBox {...props} />
        </HStack>
      </VStack>
    </>
  )
}

// Displays the full logo on larger screens, small logo on mobile
function LogoBox(): JSX.Element {
  return (
    <>
      <SpanBox
        css={{
          ml: '25px',
          height: '24px',
          width: '232px',
          minWidth: '232px',
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

function ControlButtonBox(props: ReaderHeaderProps): JSX.Element {
  return (
    <>
      <HStack
        alignment="center"
        distribution="end"
        css={{
          marginLeft: 'auto',
          marginRight: '45px',
          width: '100px',
          height: '100%',
          gap: '20px',
          minWidth: '121px',
          '@mdDown': {
            display: 'none',
          },
        }}
      >
        <Button
          style="articleActionIcon"
          onClick={() => {
            props.showDisplaySettingsModal(true)
          }}
        >
          <TooltipWrapped tooltipContent="Adjust Display Settings">
            <TextAa size={25} color="#6A6968" />
          </TooltipWrapped>
        </Button>
        <PrimaryDropdown>
          <DotsThreeOutline size={25} color="#6A6968" />
        </PrimaryDropdown>
      </HStack>

      <HStack
        alignment="center"
        distribution="end"
        css={{
          marginLeft: 'auto',
          marginRight: '20px',
          width: '100px',
          height: '100%',
          gap: '20px',
          '@md': {
            display: 'none',
          },
        }}
      >
        <PrimaryDropdown />
      </HStack>
    </>
  )
}
