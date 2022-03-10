import { gql } from 'graphql-request'
import useSWR from 'swr'
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
  color: string
  description?: string
  createdAt: Date
}

export function useGetLabelsQuery(): LabelsQueryResponse {
  const query = gql`
    query GetLabels {
      labels {
        ... on LabelsSuccess {
          labels {
            id
            name
            color
            description
            createdAt
          }
        }
        ... on LabelsError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, isValidating } = useSWR(query, publicGqlFetcher)

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
