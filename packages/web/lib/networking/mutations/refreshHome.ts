import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type RefreshHomeResponseData = {
  success?: boolean
  errorCodes?: string[]
}

type RefreshHomeResponse = {
  refreshHome?: RefreshHomeResponseData
}

export async function refreshHomeMutation(): Promise<boolean> {
  const mutation = gql`
    mutation refreshHome {
      refreshHome {
        ... on RefreshHomeSuccess {
          success
        }
        ... on RefreshHomeError {
          errorCodes
        }
      }
    }
  `

  try {
    const response = await gqlFetcher(mutation)
    const data = response as RefreshHomeResponse | undefined
    if (data?.refreshHome?.errorCodes) {
      return false
    }
    return data?.refreshHome?.success ?? false
  } catch (error) {
    console.error(error)
    return false
  }
}
