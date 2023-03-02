import { HStack, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { DotsThreeOutline, TextAa } from 'phosphor-react'
import { PrimaryDropdown } from '../PrimaryDropdown'
import { TooltipWrapped } from '../../elements/Tooltip'
import { LogoBox } from '../../elements/LogoBox'

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
          borderBottom: '1px solid transparent',
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
        <PrimaryDropdown showThemeSection={false}>
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
        <PrimaryDropdown showThemeSection={false} />
      </HStack>
    </>
  )
}
