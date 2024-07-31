import { useCallback, useEffect, useRef, useState } from 'react'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { SpanBox, VStack } from '../../elements/LayoutPrimitives'
import {
  ModalRoot,
  ModalOverlay,
  ModalContent,
  ModalTitleBar,
} from '../../elements/ModalPrimitives'
import { LabelsProvider, SetLabelsControl } from './SetLabelsControl'
import { showSuccessToast } from '../../../lib/toastHelpers'
import { v4 as uuidv4 } from 'uuid'
import { randomLabelColorHex } from '../../../utils/settings-page/labels/labelColorObjects'
import { LabelsDispatcher } from '../../../lib/hooks/useSetPageLabels'
import * as Dialog from '@radix-ui/react-dialog'
import {
  useCreateLabel,
  useGetLabels,
} from '../../../lib/networking/labels/useLabels'

type SetLabelsModalProps = {
  provider: LabelsProvider

  onOpenChange: (open: boolean) => void

  selectedLabels: Label[]
  dispatchLabels: LabelsDispatcher
}

export function SetLabelsModal(props: SetLabelsModalProps): JSX.Element {
  const [inputValue, setInputValue] = useState('')
  const { selectedLabels, dispatchLabels } = props
  const { data: availableLabels } = useGetLabels()
  const [tabCount, setTabCount] = useState(-1)
  const [tabStartValue, setTabStartValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const errorTimeoutRef = useRef<NodeJS.Timeout | undefined>()
  const [highlightLastLabel, setHighlightLastLabel] = useState(false)

  const createLabel = useCreateLabel()

  const showMessage = useCallback(
    (msg: string, timeout?: number) => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = undefined
      }
      setErrorMessage(msg)
      if (timeout) {
        errorTimeoutRef.current = setTimeout(() => {
          setErrorMessage(undefined)
          if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current)
            errorTimeoutRef.current = undefined
          }
        }, timeout)
      }
    },
    [errorTimeoutRef]
  )

  useEffect(() => {
    const maxLengthMessage = 'Max label length: 48 chars'

    if (inputValue.length >= 48) {
      showMessage(maxLengthMessage)
    } else if (errorMessage === maxLengthMessage) {
      setErrorMessage(undefined)
    }

    if (inputValue.length > 0) {
      setHighlightLastLabel(false)
    }
  }, [errorMessage, inputValue, showMessage])

  const clearInputState = useCallback(() => {
    setTabCount(-1)
    setInputValue('')
    setTabStartValue('')
    setHighlightLastLabel(false)
  }, [])

  const createLabelAsync = useCallback(
    (newLabels: Label[], tempLabel: Label) => {
      ;(async () => {
        const currentLabels = newLabels
        const newLabel = await createLabel.mutateAsync({
          name: tempLabel.name,
          color: tempLabel.color,
          description: undefined,
        })
        const idx = currentLabels.findIndex((l) => l.id === tempLabel.id)
        if (newLabel) {
          showSuccessToast(`Created label ${newLabel.name}`, {
            position: 'bottom-right',
          })
          if (idx !== -1) {
            currentLabels[idx] = newLabel
            dispatchLabels({ type: 'SAVE', labels: [...currentLabels] })
          } else {
            dispatchLabels({
              type: 'SAVE',
              labels: [...currentLabels, newLabel],
            })
          }
        } else {
          showMessage(`Error creating label ${tempLabel.name}`, 5000)
          if (idx !== -1) {
            currentLabels.splice(idx, 1)
            dispatchLabels({ type: 'SAVE', labels: [...currentLabels] })
          }
        }
      })()
    },
    [dispatchLabels, showMessage]
  )

  const selectOrCreateLabel = useCallback(
    (value: string) => {
      const current = selectedLabels ?? []
      const lowerCasedValue = value.toLowerCase()
      const existing = availableLabels?.find(
        (l) => l.name.toLowerCase() == lowerCasedValue
      )

      if (lowerCasedValue.length < 1) {
        return
      }

      if (existing) {
        const isAdded = selectedLabels.find(
          (l) => l.name.toLowerCase() == lowerCasedValue
        )
        if (!isAdded) {
          dispatchLabels({ type: 'SAVE', labels: [...current, existing] })
          clearInputState()
        } else {
          showMessage(`label ${value} already added.`, 5000)
        }
      } else {
        const tempLabel = {
          id: uuidv4(),
          name: value,
          color: randomLabelColorHex(),
          description: '',
          createdAt: new Date(),
        }
        const newLabels = [...current, tempLabel]
        dispatchLabels({ type: 'TEMP', labels: newLabels })
        clearInputState()

        createLabelAsync(newLabels, tempLabel)
      }
    },
    [
      availableLabels,
      selectedLabels,
      dispatchLabels,
      clearInputState,
      createLabelAsync,
      showMessage,
    ]
  )

  const deleteLastLabel = useCallback(() => {
    if (highlightLastLabel) {
      const current = selectedLabels
      current.pop()
      dispatchLabels({ type: 'SAVE', labels: [...current] })
      setHighlightLastLabel(false)
    } else {
      setHighlightLastLabel(true)
    }
  }, [highlightLastLabel, selectedLabels, dispatchLabels])

  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <ModalOverlay />
        <ModalContent
          tabIndex={0}
          css={{
            border: '1px solid $grayBorder',
            backgroundColor: '$thBackground',
          }}
          onPointerDownOutside={(event) => {
            event.preventDefault()
            props.onOpenChange(false)
          }}
          onEscapeKeyDown={(event) => {
            props.onOpenChange(false)
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <VStack distribution="start" css={{ height: '100%' }}>
            <SpanBox css={{ pt: '0px', px: '16px', width: '100%' }}>
              <ModalTitleBar title="Labels" onOpenChange={props.onOpenChange} />
            </SpanBox>
            <SetLabelsControl
              inputValue={inputValue}
              setInputValue={setInputValue}
              clearInputState={clearInputState}
              selectedLabels={props.selectedLabels}
              dispatchLabels={props.dispatchLabels}
              tabCount={tabCount}
              setTabCount={setTabCount}
              tabStartValue={tabStartValue}
              setTabStartValue={setTabStartValue}
              highlightLastLabel={highlightLastLabel}
              setHighlightLastLabel={setHighlightLastLabel}
              deleteLastLabel={deleteLastLabel}
              selectOrCreateLabel={selectOrCreateLabel}
              errorMessage={errorMessage}
            />
          </VStack>
        </ModalContent>
      </Dialog.Portal>
    </ModalRoot>
  )
}
