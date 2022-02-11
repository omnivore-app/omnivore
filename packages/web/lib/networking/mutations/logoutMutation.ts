import { gql } from 'graphql-request'
import { publicGqlFetcher } from '../networkHelpers'

export async function logoutMutation(): Promise<boolean> {
  const mutation = gql`
    mutation logOut {
      logOut {
        ... on LogOutError {
          errorCodes
        }
        ... on LogOutSuccess {
          message
        }
      }
    }
  `

  try {
    // Do not require auth to logout to prevent loops
    // where users are stuck in a pending state
    await publicGqlFetcher(mutation)
    window.localStorage.removeItem('authVerified')
    window.localStorage.removeItem('authToken')
    return true
  } catch {
    return false
  }
}
