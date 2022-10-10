import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export async function deleteLinkMutation(linkId: string): Promise<unknown> {
  const mutation = gql`
    mutation SetBookmarkArticle($input: SetBookmarkArticleInput!) {
      setBookmarkArticle(input: $input) {
        ... on SetBookmarkArticleSuccess {
          bookmarkedArticle {
            id
          }
        }
        ... on SetBookmarkArticleError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, {
      input: { articleID: linkId, bookmark: false },
    })
    return data
  } catch (error) {
    console.log('SetBookmarkArticleOutput error', error)
    return undefined
  }
}
