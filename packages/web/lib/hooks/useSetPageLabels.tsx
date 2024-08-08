import { useCallback, useEffect, useReducer } from 'react'
import { Label } from '../networking/fragments/labelFragment'
import { showErrorToast } from '../toastHelpers'
import throttle from 'lodash/throttle'
import { useSetItemLabels } from '../networking/library_items/useLibraryItems'

export type LabelAction = 'RESET' | 'TEMP' | 'SAVE'
export type LabelsDispatcher = (action: {
  type: LabelAction
  labels: Label[]
}) => void

export const useSetPageLabels = (
  libraryItemId?: string,
  libraryItemSlug?: string
): [{ labels: Label[] }, LabelsDispatcher] => {
  const setItemLabels = useSetItemLabels()
  const saveLabels = (
    labels: Label[],
    libraryItemId: string,
    libraryItemSlug: string
  ) => {
    ;(async () => {
      if (libraryItemId) {
        const result = await setItemLabels.mutateAsync({
          itemId: libraryItemId,
          slug: libraryItemSlug,
          labels,
        })
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
      slug: string | undefined
      throttledSave: (labels: Label[], articleId: string, slug: string) => void
    },
    action: {
      type: string
      labels: Label[]
      articleId?: string
      slug?: string
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
        if (state.articleId && state.slug) {
          state.throttledSave(action.labels, state.articleId, state.slug)
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
          slug: action.slug,
          articleId: action.articleId,
        }
      }
      default:
        return state
    }
  }

  const debouncedSave = useCallback(
    throttle(
      (labels: Label[], articleId: string, slug: string) =>
        saveLabels(labels, articleId, slug),
      2000
    ),
    []
  )

  useEffect(() => {
    dispatchLabels({
      type: 'UPDATE_ARTICLE_ID',
      labels: [],
      slug: libraryItemSlug,
      articleId: libraryItemId,
    })
  }, [libraryItemId])

  const [labels, dispatchLabels] = useReducer(labelsReducer, {
    labels: [],
    articleId: libraryItemId,
    slug: libraryItemSlug,
    throttledSave: debouncedSave,
  })

  return [labels, dispatchLabels]
}
