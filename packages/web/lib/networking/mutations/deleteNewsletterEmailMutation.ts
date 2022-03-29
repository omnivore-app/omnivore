import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export async function deleteNewsletterEmailMutation(
  newsletterEmailId: string
): Promise<string | undefined> {
  const mutation = gql`
    mutation DeleteNewsletterEmailMutation($newsletterEmailId: ID!) {
      deleteNewsletterEmail(newsletterEmailId: $newsletterEmailId) {
        ... on DeleteNewsletterEmailSuccess {
          newsletterEmail {
            id
            address
          }
        }
        ... on DeleteNewsletterEmailError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, { newsletterEmailId })
    console.log('delete email', data)
    return 'data'
  } catch (error) {
    console.log('deleteNewsletterEmailMutation error', error)
    return undefined
  }
}
