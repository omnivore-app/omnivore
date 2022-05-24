import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type AddPopularReadResponse = {
  addPopularRead?: AddPopularReadData
  errorCodes?: string[]
}

type AddPopularReadData = {
  pageId: string | undefined
}

export async function addPopularReadMutation(
  readName: string
): Promise<string | undefined> {
  const mutation = gql`
    mutation {
      addPopularRead(name: "${readName}") {
        ... on AddPopularReadSuccess {
          pageId
        }
        ... on AddPopularReadError {
          errorCodes
        }
      }
    }
  `

  console.log('addPopularReadMutation', mutation)

  try {
    const response = await gqlFetcher(mutation, { readName })
    console.log('response', response)
    const data = response as AddPopularReadResponse | undefined
    return data?.addPopularRead?.pageId
  } catch (error) {
    console.error(error)
    return undefined
  }
}
