import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gqlFetcher } from '../networkHelpers'
import {
  GQL_CREATE_HIGHLIGHT,
  GQL_DELETE_HIGHLIGHT,
  GQL_MERGE_HIGHLIGHT,
  GQL_UPDATE_HIGHLIGHT,
} from './gql'
import { updateItemProperty } from '../library_items/useLibraryItems'
import { Highlight, HighlightType } from '../fragments/highlightFragment'
import { UpdateHighlightInput } from '../mutations/updateHighlightMutation'
import { MergeHighlightInput } from '../mutations/mergeHighlightMutation'

export const useCreateHighlight = () => {
  const queryClient = useQueryClient()
  const createHighlight = async (variables: {
    itemId: string
    slug: string | undefined
    input: CreateHighlightInput
  }) => {
    const result = (await gqlFetcher(GQL_CREATE_HIGHLIGHT, {
      input: variables.input,
    })) as CreateHighlightData
    if (result.createHighlight.errorCodes?.length) {
      throw new Error(result.createHighlight.errorCodes[0])
    }
    return result.createHighlight.highlight
  }
  return useMutation({
    mutationFn: createHighlight,
    onSuccess: (newHighlight, variables) => {
      if (newHighlight) {
        updateItemProperty(
          queryClient,
          variables.itemId,
          variables.slug,
          (item) => {
            return {
              ...item,
              highlights: [...(item.highlights ?? []), newHighlight],
            }
          }
        )
      }
    },
  })
}

export const useDeleteHighlight = () => {
  const queryClient = useQueryClient()
  const deleteHighlight = async (variables: {
    itemId: string
    slug: string
    highlightId: string
  }) => {
    const result = (await gqlFetcher(GQL_DELETE_HIGHLIGHT, {
      highlightId: variables.highlightId,
    })) as DeleteHighlightData
    if (result.deleteHighlight.errorCodes?.length) {
      throw new Error(result.deleteHighlight.errorCodes[0])
    }
    return result.deleteHighlight.highlight
  }
  return useMutation({
    mutationFn: deleteHighlight,
    onSuccess: (deletedHighlight, variables) => {
      if (deletedHighlight) {
        updateItemProperty(
          queryClient,
          variables.itemId,
          variables.slug,
          (item) => {
            return {
              ...item,
              highlights: (item.highlights ?? []).filter(
                (h) => h.id != deletedHighlight.id
              ),
            }
          }
        )
      }
    },
  })
}

export const useUpdateHighlight = () => {
  const queryClient = useQueryClient()
  const updateHighlight = async (variables: {
    itemId: string
    slug: string | undefined
    input: UpdateHighlightInput
  }) => {
    const result = (await gqlFetcher(GQL_UPDATE_HIGHLIGHT, {
      input: {
        highlightId: variables.input.highlightId,
        annotation: variables.input.annotation,
        sharedAt: variables.input.sharedAt,
        color: variables.input.color,
      },
    })) as UpdateHighlightData
    if (result.updateHighlight.errorCodes?.length) {
      throw new Error(result.updateHighlight.errorCodes[0])
    }
    return result.updateHighlight.highlight
  }
  return useMutation({
    mutationFn: updateHighlight,
    onSuccess: (updatedHighlight, variables) => {
      if (updatedHighlight) {
        updateItemProperty(
          queryClient,
          variables.itemId,
          variables.slug,
          (item) => {
            return {
              ...item,
              highlights: [
                ...(item.highlights ?? []).filter(
                  (h) => h.id != updatedHighlight.id
                ),
                updatedHighlight,
              ],
            }
          }
        )
      }
    },
  })
}

export const useMergeHighlight = () => {
  const queryClient = useQueryClient()
  const mergeHighlight = async (variables: {
    itemId: string
    slug: string
    input: MergeHighlightInput
  }) => {
    const result = (await gqlFetcher(GQL_MERGE_HIGHLIGHT, {
      input: {
        id: variables.input.id,
        shortId: variables.input.shortId,
        articleId: variables.input.articleId,
        patch: variables.input.patch,
        quote: variables.input.quote,
        prefix: variables.input.prefix,
        suffix: variables.input.suffix,
        html: variables.input.html,
        annotation: variables.input.annotation,
        overlapHighlightIdList: variables.input.overlapHighlightIdList,
        highlightPositionPercent: variables.input.highlightPositionPercent,
        highlightPositionAnchorIndex:
          variables.input.highlightPositionAnchorIndex,
      },
    })) as MergeHighlightData
    if (result.mergeHighlight.errorCodes?.length) {
      throw new Error(result.mergeHighlight.errorCodes[0])
    }
    return result.mergeHighlight
  }
  return useMutation({
    mutationFn: mergeHighlight,
    onSuccess: (mergeHighlights, variables) => {
      if (mergeHighlights && mergeHighlights.highlight) {
        const newHighlight = mergeHighlights.highlight
        const mergedIds = mergeHighlights.overlapHighlightIdList ?? []
        updateItemProperty(
          queryClient,
          variables.itemId,
          variables.slug,
          (item) => {
            return {
              ...item,
              highlights: [
                ...(item.highlights ?? []).filter(
                  (h) => mergedIds.indexOf(h.id) == -1
                ),
                newHighlight,
              ],
            }
          }
        )
      }
    },
  })
}

type MergeHighlightData = {
  mergeHighlight: MergeHighlightResult
}

type MergeHighlightResult = {
  highlight?: Highlight
  overlapHighlightIdList?: string[]
  errorCodes?: string[]
}

type UpdateHighlightData = {
  updateHighlight: UpdateHighlightResult
}

type UpdateHighlightResult = {
  highlight?: Highlight
  errorCodes?: string[]
}

type DeleteHighlightData = {
  deleteHighlight: DeleteHighlightResult
}

type DeleteHighlightResult = {
  highlight?: Highlight
  errorCodes?: string[]
}

type CreateHighlightData = {
  createHighlight: CreateHighlightResult
}

type CreateHighlightResult = {
  highlight?: Highlight
  errorCodes?: string[]
}

export type CreateHighlightInput = {
  id: string
  shortId: string
  articleId: string

  prefix?: string
  suffix?: string
  quote?: string
  html?: string
  color?: string
  annotation?: string

  patch?: string

  highlightPositionPercent?: number
  highlightPositionAnchorIndex?: number

  type?: HighlightType
}
