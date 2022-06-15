import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type QueryResult = {
  sent: boolean
  errorCodes?: unknown[]
}

export async function sendInstallInstructions(): Promise<any | undefined> {
  const query = gql`
    query SendInstallInstructions {
      sendInstallInstructions {
        ... on SendInstallInstructionsSuccess {
          sent
        }
      }

      sendInstallInstructions {
        ... on SendInstallInstructionsError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(query)) as QueryResult
    return data.errorCodes ? undefined : data.sent
  } catch (error) {
    console.log('sendInstallInstructions error', error)
    return undefined
  }
}
