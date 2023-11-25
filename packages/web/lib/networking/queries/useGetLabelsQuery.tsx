import { gql } from "graphql-request"
import useSWR from "swr"
import { Label, labelFragment } from "../fragments/labelFragment"
import { publicGqlFetcher } from "../networkHelpers"

type LabelsQueryResponse = {
  error: any
  isLoading: boolean
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

  const { data, error, mutate, isValidating } = useSWR(query, publicGqlFetcher)

  try {
    if (data && !error) {
      const result = data as LabelsResponseData
      const labels = result.labels?.labels as Label[]
      return {
        error,
        isLoading: !error && !data,
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
    error,
    isLoading: !error && !data,
    isValidating: false,
    labels: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
