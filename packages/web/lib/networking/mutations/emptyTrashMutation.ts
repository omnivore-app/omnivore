import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type EmptyTrashResult = {
  success?: boolean
  errorCodes?: string[]
}

type EmptyTrashApiResponse = {
  emptyTrash: EmptyTrashResult
}

export async function emptyTrashMutation(): Promise<boolean> {
  const mutation = gql`
    mutation emptyTrash {
      emptyTrash {
        ... on EmptyTrashError {
          errorCodes
        }
        ... on EmptyTrashSuccess {
          success
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, {})) as EmptyTrashApiResponse
    if ('success' in data.emptyTrash) {
      return data.emptyTrash.success as boolean
    }
    return false
  } catch {
    return false
  }
}
