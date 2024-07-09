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
    mutation AddPopularRead($name: String!) {
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

  try {
    const response = await gqlFetcher(mutation, { readName })
    const data = response as AddPopularReadResponse | undefined
    return data?.addPopularRead?.pageId
  } catch (error) {
    console.error(error)
    return undefined
  }
}
