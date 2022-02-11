import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export async function createNewsletterEmailMutation(): Promise<string | undefined> {
  const mutation = gql`
    mutation createNewsletterEmailMutation {
      createNewsletterEmail {
        ... on CreateNewsletterEmailSuccess {
          newsletterEmail {
            id
            address
          }
        }
        ... on CreateNewsletterEmailError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation)
    console.log('created email', data)
    return 'data'
  } catch (error) {
    console.log('createNewsletterEmailMutation error', error)
    return undefined
  }
}
