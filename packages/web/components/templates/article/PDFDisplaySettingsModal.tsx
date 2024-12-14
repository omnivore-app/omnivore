import * as Switch from '@radix-ui/react-switch'
import { ReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { HStack, VStack } from '../../elements/LayoutPrimitives'
import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../../elements/ModalPrimitives'
import { StyledText } from '../../elements/StyledText'
import { ReaderSettingsControl } from './ReaderSettingsControl'
import { styled } from '../../tokens/stitches.config'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'

type PDFDisplaySettingsModalProps = {
  centerX: boolean
  onOpenChange: (open: boolean) => void
  triggerElementRef?: React.RefObject<HTMLElement>
  readerSettings: ReaderSettings
}

export function PDFDisplaySettingsModal(
  props: PDFDisplaySettingsModalProps
): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay css={{ backgroundColor: 'unset' }} />
      <ModalContent
        css={{
          width: '345px',
          padding: '0px',
          top: '262px',
          left: 'calc(100% - 250px)',
          '@lgDown': {
            top: '300px',
            left: '50%',
          },
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault()
          props.onOpenChange(false)
        }}
      >
        <VStack css={{ width: '100%' }}>
          <PDFSettings readerSettings={props.readerSettings} />
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}

type SettingsProps = {
  readerSettings: ReaderSettings
}

function PDFSettings(props: SettingsProps): JSX.Element {
  const { readerSettings } = props
  const [showPDFToolBar, setShowPDFToolBar] = usePersistedState({
    key: 'reader-show-pdf-tool-bar',
    initialValue: true,
    isSessionStorage: false,
  })
  const [rememberLatestPage, setLatestPage] = usePersistedState({
    key: 'reader-remember-latest-page',
    initialValue: true,
    isSessionStorage: false,
  })

  const [useNativeReader, setUseNativeReader] = usePersistedState({
    key: 'reader-use-native-reader',
    initialValue: false,
    isSessionStorage: false,
  })

  return (
    <VStack
      css={{ width: '100%', minHeight: '320px', p: '10px' }}
      alignment="start"
      distribution="start"
    >
      <HStack
        css={{
          width: '100%',
          pr: '30px',
          alignItems: 'center',
          '&:hover': {
            opacity: 0.8,
          },
          '&[data-state="on"]': {
            bg: '$thBackground',
          },
        }}
        alignment="start"
        distribution="between"
      >
        <Label htmlFor="show-menu-bar" css={{ width: '100%' }}>
          <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
            Show Tool Bar
          </StyledText>
        </Label>

        <SwitchRoot
          id="show-menu-bar"
          checked={showPDFToolBar}
          onCheckedChange={(checked: boolean) => {
            setShowPDFToolBar(checked)
            document.dispatchEvent(new Event('pdfReaderUpdateSettings'))
          }}
        >
          <SwitchThumb />
        </SwitchRoot>
      </HStack>

      <HStack
        css={{
          width: '100%',
          pr: '30px',
          alignItems: 'center',
          '&:hover': {
            opacity: 0.8,
          },
          '&[data-state="on"]': {
            bg: '$thBackground',
          },
        }}
        alignment="start"
        distribution="between"
      >
        <Label htmlFor="remember-latest-page" css={{ width: '100%' }}>
          <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
            Remember last page visited
          </StyledText>
        </Label>

        <SwitchRoot
          id="remember-latest-page"
          checked={rememberLatestPage}
          onCheckedChange={(checked: boolean) => {
            setLatestPage(checked)
            document.dispatchEvent(new Event('pdfReaderUpdateSettings'))
          }}
        >
          <SwitchThumb />
        </SwitchRoot>
      </HStack>

        <HStack
          css={{
            width: '100%',
            pr: '30px',
            alignItems: 'center',
            '&:hover': {
              opacity: 0.8,
            },
            '&[data-state="on"]': {
              bg: '$thBackground',
            },
          }}
          alignment="start"
          distribution="between"
        >
          <Label htmlFor="use-native-reader" css={{ width: '100%' }}>
            <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
              Use Browsers Native PDF Reader
            </StyledText>
          </Label>

          <SwitchRoot
            id="use-native-reader"
            checked={useNativeReader}
            onCheckedChange={(checked: boolean) => {
              setUseNativeReader(checked)
              document.dispatchEvent(new Event('pdfReaderUpdateSettings'))
            }}
          >
            <SwitchThumb />
          </SwitchRoot>
        </HStack>

      {/* <HStack
        css={{
          width: '100%',
          pr: '30px',
          alignItems: 'center',
          '&:hover': {
            opacity: 0.8,
          },
          '&[data-state="on"]': {
            bg: '$thBackground',
          },
        }}
        alignment="start"
        distribution="between"
      >
        <Label htmlFor="high-contrast-text" css={{ width: '100%' }}>
          <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
            High Contrast Text
          </StyledText>
        </Label>
        <SwitchRoot
          id="high-contrast-text"
          checked={readerSettings.highContrastText ?? false}
          onCheckedChange={(checked: boolean) => {
            readerSettings.setHighContrastText(checked)
          }}
        >
          <SwitchThumb />
        </SwitchRoot>
      </HStack> */}
    </VStack>
  )
}

const SwitchRoot = styled(Switch.Root, {
  all: 'unset',
  width: 42,
  height: 25,
  backgroundColor: '$thBorderColor',
  borderRadius: '9999px',
  position: 'relative',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&:focus': { boxShadow: `0 0 0 2px $thBorderColor` },
  '&[data-state="checked"]': { backgroundColor: '$thBorderColor' },
})

const SwitchThumb = styled(Switch.Thumb, {
  display: 'block',
  width: 21,
  height: 21,
  backgroundColor: '$thTextContrast2',
  borderRadius: '9999px',
  transition: 'transform 100ms',
  transform: 'translateX(2px)',
  willChange: 'transform',
  '&[data-state="checked"]': { transform: 'translateX(19px)' },
})

const Label = styled('label', {
  color: 'white',
  fontSize: 15,
  lineHeight: 1,
})
