import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gqlFetcher } from '../networkHelpers'
import {
  GQL_CREATE_LABEL,
  GQL_DELETE_LABEL,
  GQL_GET_LABELS,
  GQL_UPDATE_LABEL,
} from './gql'
import { Label } from '../fragments/labelFragment'

export function useGetLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const response = (await gqlFetcher(GQL_GET_LABELS)) as LabelsData
      if (response.labels?.errorCodes?.length) {
        throw new Error(response.labels.errorCodes[0])
      }
      return response.labels?.labels
    },
  })
}

export const useCreateLabel = () => {
  const queryClient = useQueryClient()
  const createLabel = async (variables: {
    name: string
    color: string
    description: string | undefined
  }) => {
    const result = (await gqlFetcher(GQL_CREATE_LABEL, {
      input: {
        name: variables.name,
        color: variables.color,
        description: variables.description,
      },
    })) as CreateLabelData
    if (result.createLabel.errorCodes?.length) {
      throw new Error(result.createLabel.errorCodes[0])
    }
    return result.createLabel.label
  }
  return useMutation({
    mutationFn: createLabel,
    onSuccess: (newLabel) => {
      const keys = queryClient.getQueryCache().findAll({ queryKey: ['labels'] })
      keys.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (data: Label[]) => {
          return [...data, newLabel]
        })
      })
    },
  })
}

export const useDeleteLabel = () => {
  const queryClient = useQueryClient()
  const deleteLabel = async (variables: { labelId: string }) => {
    const result = (await gqlFetcher(GQL_DELETE_LABEL, {
      id: variables.labelId,
    })) as DeleteLabelData
    if (result.deleteLabel.errorCodes?.length) {
      throw new Error(result.deleteLabel.errorCodes[0])
    }
    return result.deleteLabel?.label?.id
  }
  return useMutation({
    mutationFn: deleteLabel,
    onSuccess: (deletedId) => {
      if (deletedId) {
        const keys = queryClient
          .getQueryCache()
          .findAll({ queryKey: ['labels'] })
        keys.forEach((query) => {
          queryClient.setQueryData(query.queryKey, (data: Label[]) => {
            return data.filter((label) => label.id !== deletedId)
          })
        })
      }
    },
  })
}

export const useUpdateLabel = () => {
  const queryClient = useQueryClient()
  const updateLabel = async (variables: {
    labelId: string
    name: string
    color: string
    description: string
  }) => {
    const result = (await gqlFetcher(GQL_UPDATE_LABEL, {
      input: {
        labelId: variables.labelId,
        name: variables.name,
        color: variables.color,
        description: variables.description,
      },
    })) as UpdateLabelData
    if (result.updateLabel.errorCodes?.length) {
      throw new Error(result.updateLabel.errorCodes[0])
    }
    return result.updateLabel?.label
  }
  return useMutation({
    mutationFn: updateLabel,
    onSuccess: (updatedLabel) => {
      if (updatedLabel) {
        const keys = queryClient
          .getQueryCache()
          .findAll({ queryKey: ['labels'] })
        keys.forEach((query) => {
          queryClient.setQueryData(query.queryKey, (data: Label[]) => {
            return [
              ...data.filter((label) => label.id !== updatedLabel.id),
              updatedLabel,
            ]
          })
        })
      }
    },
  })
}

type LabelsResult = {
  labels?: Label[]
  errorCodes?: string[]
}

type LabelsData = {
  labels?: LabelsResult
}

type CreateLabelResult = {
  label?: Label
  errorCodes?: string[]
}

type CreateLabelData = {
  createLabel: CreateLabelResult
}

type DeleteLabelResult = {
  label?: Label
  errorCodes?: string[]
}

type DeleteLabelData = {
  deleteLabel: DeleteLabelResult
}

type UpdateLabelResult = {
  label?: Label
  errorCodes?: string[]
}

type UpdateLabelData = {
  updateLabel: UpdateLabelResult
}
