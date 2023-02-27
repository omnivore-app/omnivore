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
  const [previousSelectedLabels, setPreviousSelectedLabels] = useState(
    props.provider.labels ?? []
  )
  const [selectedLabels, setSelectedLabels] = useState(
    props.provider.labels ?? []
  )

  const labelsEqual = (left: Label[], right: Label[]) => {
    if (left.length !== right.length) {
      return false
    }

    for (const label of left) {
      if (!right.find((r) => label.id == r.id)) {
        return false
      }
    }

    return true
  }

  const onOpenChange = useCallback(
    async (open: boolean) => {
      // Only make API call if the labels have been modified
      if (!labelsEqual(selectedLabels, previousSelectedLabels)) {
        const result = await props.save(selectedLabels)
        if (props.onLabelsUpdated) {
          props.onLabelsUpdated(selectedLabels)
        }

        if (!result) {
          showErrorToast('Error updating labels')
        }
      }

      props.onOpenChange(open)
    },
    [props, selectedLabels, previousSelectedLabels]
  )

  useEffect(() => {
    if (labelsEqual(selectedLabels, previousSelectedLabels)) {
      return
    }

    props
      .save(selectedLabels)
      .then((result) => {
        setPreviousSelectedLabels(result ?? [])
      })
      .catch((err) => {
        console.log('error saving labels: ', err)
      })
  }, [props, selectedLabels, previousSelectedLabels, setPreviousSelectedLabels])

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
            selectedLabels={selectedLabels}
            setSelectedLabels={setSelectedLabels}
            onLabelsUpdated={props.onLabelsUpdated}
          />
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
