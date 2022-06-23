import { VStack } from '../../elements/LayoutPrimitives'
import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
} from '../../elements/ModalPrimitives'
import { ReaderSettingsControl } from './ReaderSettingsControl'


type DisplaySettingsModalProps = {
  centerX: boolean
  onOpenChange: (open: boolean) => void
  triggerElementRef?: React.RefObject<HTMLElement>
  articleActionHandler: (action: string, arg?: number | string) => void
}

export function DisplaySettingsModal(props: DisplaySettingsModalProps): JSX.Element {
  const top = props.triggerElementRef?.current?.getBoundingClientRect().bottom ?? 0
  const left = props.triggerElementRef?.current?.getBoundingClientRect().left ?? 0

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalContent
        css={{
          width: '245px',
          top: props.triggerElementRef?.current ? top : '50%',
          left: props.triggerElementRef?.current ? (left - (props.centerX ? 265 / 2 : 0)) : '50%',
          transform: props.triggerElementRef?.current ? 'unset' : 'translate(-50%, -50%)',
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault()
          props.onOpenChange(false)
        }}
      >
        <VStack css={{ width: '100%' }}>
          <ReaderSettingsControl
            articleActionHandler={props.articleActionHandler}
          />
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
