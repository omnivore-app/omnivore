import { useCallback, useEffect, useState } from 'react'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { showErrorToast } from '../../../lib/toastHelpers'
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

  onLabelsUpdated?: (labels: Label[]) => void
  onOpenChange: (open: boolean) => void
  save: (labels: Label[]) => Promise<Label[] | undefined>
}

export function SetLabelsModal(props: SetLabelsModalProps): JSX.Element {
  const [selectedLabels, setSelectedLabels] = useState(
    props.provider.labels ?? []
  )

  const containsTemporaryLabel = (labels: Label[]) => {
    return !!labels.find((l) => '_temporary' in l)
  }

  const onOpenChange = useCallback(
    (open: boolean) => {
      ;(async () => {
        await props.save(selectedLabels)
        props.onOpenChange(open)
      })()
    },
    [props, selectedLabels]
  )

  useEffect(() => {
    if (!containsTemporaryLabel(selectedLabels)) {
      ;(async () => {
        await props.save(selectedLabels)
      })()
    }
  }, [props, selectedLabels])

  return (
    <ModalRoot defaultOpen onOpenChange={onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{
          border: '1px solid $grayBorder',
          backgroundColor: '$thBackground',
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault()
          onOpenChange(false)
        }}
      >
        <VStack distribution="start" css={{ height: '100%' }}>
          <SpanBox css={{ pt: '0px', px: '16px', width: '100%' }}>
            <ModalTitleBar title="Labels" onOpenChange={onOpenChange} />
          </SpanBox>
          <SetLabelsControl
            provider={props.provider}
            selectedLabels={selectedLabels}
            setSelectedLabels={setSelectedLabels}
            onLabelsUpdated={props.onLabelsUpdated}
          />
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
