import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export enum BulkAction {
  ARCHIVE = 'ARCHIVE',
  DELETE = 'DELETE',
  ADD_LABELS = 'ADD_LABELS',
}

type BulkActionResponseData = {
  success: boolean
}

type BulkActionResponse = {
  errorCodes?: string[]
  bulkAction?: BulkActionResponseData
}

export async function bulkActionMutation(
  action: BulkAction,
  query: string,
  expectedCount: number,
  labelIds?: string[]
): Promise<boolean> {
  const mutation = gql`
    mutation BulkAction(
      $action: BulkActionType!
      $query: String!
      $expectedCount: Int
      $labelIds: [ID!]
    ) {
      bulkAction(
        query: $query
        action: $action
        labelIds: $labelIds
        expectedCount: $expectedCount
      ) {
        ... on BulkActionSuccess {
          success
        }
        ... on BulkActionError {
          errorCodes
        }
      }
    }
  `

  console.log('bulkActionbulkActionMutation', mutation)

  try {
    const response = await gqlFetcher(mutation, {
      action,
      query,
      labelIds,
      expectedCount,
    })
    console.log('response', response)
    const data = response as BulkActionResponse | undefined
    return data?.bulkAction?.success ?? false
  } catch (error) {
    console.error(error)
    return false
  }
}
