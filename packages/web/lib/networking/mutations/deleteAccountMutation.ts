import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type DeleteAccountData = {
  userID?: string
}

type DeleteAccountResponse = {
  errorCodes?: string[]
  deleteAccount?: DeleteAccountData
}

export async function deleteAccountMutation(
  userId: string
): Promise<string | undefined> {
  const mutation = gql`
    mutation DeleteAccount($userId: ID!) {
      deleteAccount(userID: $userId) {
        ... on DeleteAccountSuccess {
          userID
        }
        ... on DeleteAccountError {
          errorCodes
        }
      }
    }
  `

  try {
    const response = await gqlFetcher(mutation, { userId })
    console.log('response', response)
    const data = response as DeleteAccountResponse | undefined
    return data?.deleteAccount?.userID
  } catch (error) {
    console.error(error)
    return undefined
  }
}
