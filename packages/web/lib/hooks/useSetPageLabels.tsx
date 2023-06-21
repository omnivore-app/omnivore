import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { setLabelsMutation } from '../networking/mutations/setLabelsMutation'
import { Label } from '../networking/fragments/labelFragment'
import { showErrorToast } from '../toastHelpers'
import throttle from 'lodash/throttle'

export type LabelAction = 'RESET' | 'TEMP' | 'SAVE'
export type LabelsDispatcher = (action: {
  type: LabelAction
  labels: Label[]
}) => void

export const useSetPageLabels = (
  articleId?: string
): [{ labels: Label[] }, LabelsDispatcher] => {
  const saveLabels = (labels: Label[]) => {
    ;(async () => {
      const labelIds = labels.map((l) => l.id)
      if (articleId) {
        const result = await setLabelsMutation(articleId, labelIds)
        if (!result) {
          showErrorToast('Error saving labels', {
            position: 'bottom-right',
          })
        }
      }
    })()
  }

  const labelsReducer = (
    state: {
      labels: Label[]
      throttledSave: (labels: Label[]) => void
    },
    action: {
      type: string
      labels: Label[]
    }
  ) => {
    switch (action.type) {
      case 'RESET': {
        return {
          ...state,
          labels: action.labels,
        }
      }
      case 'TEMP': {
        return {
          ...state,
          labels: action.labels,
        }
      }
      case 'SAVE': {
        if (articleId) {
          state.throttledSave(action.labels)
        } else {
          showErrorToast('Unable to update labels', {
            position: 'bottom-right',
          })
        }
        return {
          ...state,
          labels: action.labels,
        }
      }
      default:
        return state
    }
  }

  const debouncedSave = useCallback(
    throttle((labels: Label[]) => saveLabels(labels), 2000),
    []
  )
  const [labels, dispatchLabels] = useReducer(labelsReducer, {
    labels: [],
    throttledSave: debouncedSave,
  })

  return [labels, dispatchLabels]
}
