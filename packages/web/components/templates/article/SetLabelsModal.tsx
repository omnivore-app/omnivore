import { useCallback, useState } from 'react'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { SpanBox, VStack } from '../../elements/LayoutPrimitives'
import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
  ModalTitleBar,
} from '../../elements/ModalPrimitives'
import { LabelsProvider, SetLabelsControl } from './SetLabelsControl'

type SetLabelsModalProps = {
  provider: LabelsProvider
  onOpenChange: (open: boolean) => void
  onLabelsChanged: (labels: Label[]) => void
  save: (labels: Label[]) => Promise<Label[] | undefined>
}

export function SetLabelsModal(props: SetLabelsModalProps): JSX.Element {
  const [selectedLabels, setSelectedLabels] = useState(props.provider.labels)
  const onOpenChange = useCallback(
    async (open: boolean) => {
      if (selectedLabels) {
        const result = await props.save(selectedLabels)
        if (result) {
          props.onLabelsChanged(result)
        } else {
          showErrorToast('Error updating labels')
        }
      }
      props.onOpenChange(open)
    },
    [props.onOpenChange]
  )

  const handleSave = useCallback(
    (labels: Label[]) => {
      setSelectedLabels(labels)
      return Promise.resolve(labels)
    },
    [selectedLabels, setSelectedLabels]
  )

  return (
    <ModalRoot defaultOpen onOpenChange={onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{ border: '1px solid $grayBorder' }}
        onPointerDownOutside={(event) => {
          event.preventDefault()
          onOpenChange(false)
        }}
      >
        <VStack distribution="start" css={{ height: '100%' }}>
          <SpanBox css={{ p: '16px', width: '100%' }}>
            <ModalTitleBar title="Labels" onOpenChange={onOpenChange} />
          </SpanBox>
          <SetLabelsControl
            provider={props.provider}
            save={handleSave}
            onLabelsChanged={props.onLabelsChanged}
          />
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
