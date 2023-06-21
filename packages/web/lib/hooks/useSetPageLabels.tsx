import { useEffect, useReducer } from 'react'
import { setLabelsMutation } from '../networking/mutations/setLabelsMutation'
import { Label } from '../networking/fragments/labelFragment'
import { showErrorToast } from '../toastHelpers'
import { LabelsProvider } from '../../components/templates/article/SetLabelsControl'

export type LabelAction = 'RESET' | 'TEMP' | 'SAVE'
export type LabelsDispatcher = (action: {
  type: LabelAction
  labels: Label[]
}) => void

export const useSetPageLabels = (
  articleId?: string
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
        if (articleId) {
          ;(async () => {
            const result = await setLabelsMutation(articleId, labelIds)
            if (result) {
              dispatchLabels({
                type: 'RESET',
                // Use the original labels value here so we dont re-order
                labels: action.labels ?? [],
              })
            } else {
              showErrorToast('Error saving labels', {
                position: 'bottom-right',
              })
            }
          })()
        } else {
          showErrorToast('Unable to update labels', {
            position: 'bottom-right',
          })
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
