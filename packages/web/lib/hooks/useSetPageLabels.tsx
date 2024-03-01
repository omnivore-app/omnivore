import { useCallback, useEffect, useReducer } from 'react'
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
  const saveLabels = (labels: Label[], articleId: string) => {
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
      articleId: string | undefined
      throttledSave: (labels: Label[], articleId: string) => void
    },
    action: {
      type: string
      labels: Label[]
      articleId?: string
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
        if (state.articleId) {
          state.throttledSave(action.labels, state.articleId)
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
      case 'UPDATE_ARTICLE_ID': {
        return {
          ...state,
          articleId: action.articleId,
        }
      }
      default:
        return state
    }
  }

  const debouncedSave = useCallback(
    throttle(
      (labels: Label[], articleId: string) => saveLabels(labels, articleId),
      2000
    ),
    []
  )

  useEffect(() => {
    dispatchLabels({
      type: 'UPDATE_ARTICLE_ID',
      labels: [],
      articleId: articleId,
    })
  }, [articleId])

  const [labels, dispatchLabels] = useReducer(labelsReducer, {
    labels: [],
    articleId: articleId,
    throttledSave: debouncedSave,
  })

  return [labels, dispatchLabels]
}
