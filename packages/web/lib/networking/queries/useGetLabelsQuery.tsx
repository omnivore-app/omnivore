import { gql } from 'graphql-request'
import useSWR from 'swr'
import { LabelColor } from '../../../utils/settings-page/labels/types';
import { Label, labelFragment } from '../fragments/labelFragment'
import { publicGqlFetcher } from '../networkHelpers'

type LabelsQueryResponse = {
  isValidating: boolean
  labels: Label[]
  revalidate: () => void
}

type LabelsResponseData = {
  labels?: LabelsData
}

type LabelsData = {
  labels?: unknown
}

export type Label = {
  id: string
  name: string
  color: LabelColor
  description?: string
  createdAt: Date
}

export function useGetLabelsQuery(): LabelsQueryResponse {
  const query = gql`
    query GetLabels {
      labels {
        ... on LabelsSuccess {
          labels {
            ...LabelFields
          }
        }
        ... on LabelsError {
          errorCodes
        }
      }
    }
    ${labelFragment}
  `

  const { data, mutate, error, isValidating } = useSWR(query, publicGqlFetcher)

  try {
    if (data) {
      const result = data as LabelsResponseData
      const labels = result.labels?.labels as Label[]
      return {
        isValidating,
        labels,
        revalidate: () => {
          mutate()
        },
      }
    }
  } catch (error) {
    console.log('error', error)
  }
  return {
    isValidating: false,
    labels: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
