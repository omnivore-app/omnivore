import { useReducer } from 'react'
import { Label } from '../networking/fragments/labelFragment'
import { showErrorToast } from '../toastHelpers'
import { setLabelsForHighlight } from '../networking/mutations/setLabelsForHighlight'
import { LabelsDispatcher } from './useSetPageLabels'

export const useSetHighlightLabels = (
  highlightId?: string
): [{ labels: Label[] }, LabelsDispatcher] => {
  const labelsReducer = (
    state: {
      labels: Label[]
    },
    action: {
      type: string
      labels: Label[]
    }
  ) => {
    switch (action.type) {
      case 'RESET': {
        return {
          labels: action.labels,
        }
      }
      case 'TEMP': {
        return {
          labels: action.labels,
        }
      }
      case 'SAVE': {
        const labelIds = action.labels.map((l) => l.id)
        if (highlightId) {
          ;(async () => {
            const result = await setLabelsForHighlight(highlightId, labelIds)
            if (result) {
              dispatchLabels({
                type: 'RESET',
                // Use original list so we don't reorder
                labels: action.labels ?? [],
              })
            } else {
              showErrorToast('Error saving labels', {
                position: 'bottom-right',
              })
            }
          })()
        } else {
          showErrorToast('Unable to update labels')
        }
        return {
          labels: action.labels,
        }
      }
      default:
        return state
    }
  }

  const [labels, dispatchLabels] = useReducer(labelsReducer, {
    labels: [],
  })

  return [labels, dispatchLabels]
}
