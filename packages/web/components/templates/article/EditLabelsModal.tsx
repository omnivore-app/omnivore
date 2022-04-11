import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
} from '../../elements/ModalPrimitives'
import { EditLabelsControl } from './EditLabelsControl'

export function EditLabelsModal(): JSX.Element {
  return (
    <ModalRoot defaultOpen>
      <ModalOverlay />
      <ModalContent
        onPointerDownOutside={(event) => {
          event.preventDefault()
        }}
        css={{ overflow: 'auto', p: '0' }}
      >
        <EditLabelsControl />
      </ModalContent>
    </ModalRoot>
  )
}
