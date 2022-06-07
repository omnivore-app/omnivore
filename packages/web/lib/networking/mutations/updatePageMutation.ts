import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type UpdatePageInput = {
  pageId: string
  title: string,
  description: string,
}

export async function updatePageMutation(
  input: UpdatePageInput
): Promise<string | undefined> {
  const mutation = gql`
    mutation {
      updatePage(
        input: {
          pageId: "${input.pageId}"
          title: "${input.title}"
          description: "${input.description}"
        }
      ) {
        ... on UpdatePageSuccess {
          updatedPage {
            id
            title
            url
            createdAt
            author
            image
            description
            publishedAt
          }
        }
        ... on UpdatePageError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation)
    const output = data as any
    return output.updatePage
  } catch (err) {
    return undefined
  }
}
