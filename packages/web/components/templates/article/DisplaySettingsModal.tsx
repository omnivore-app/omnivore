import { ReaderSettings } from '../../../lib/hooks/useReaderSettings'
import { VStack } from '../../elements/LayoutPrimitives'
import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../../elements/ModalPrimitives'
import { ReaderSettingsControl } from './ReaderSettingsControl'

type DisplaySettingsModalProps = {
  centerX: boolean
  onOpenChange: (open: boolean) => void
  triggerElementRef?: React.RefObject<HTMLElement>
  readerSettings: ReaderSettings
}

export function DisplaySettingsModal(
  props: DisplaySettingsModalProps
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
          <ReaderSettingsControl readerSettings={props.readerSettings} />
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
