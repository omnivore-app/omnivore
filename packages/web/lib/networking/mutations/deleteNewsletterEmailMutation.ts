import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { NewsletterEmail } from '../queries/useGetNewsletterEmailsQuery'

type DeleteNewsletterEmailResult = {
  deleteNewsletterEmail: CreateNewsletterEmail
  errorCodes?: unknown[]
}

type CreateNewsletterEmail = {
  newsletterEmail: NewsletterEmail
}

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
    const data = await gqlFetcher(mutation, { newsletterEmailId }) as DeleteNewsletterEmailResult
    return data.errorCodes ? undefined : data.deleteNewsletterEmail.newsletterEmail.id
  } catch (error) {
    console.log('deleteNewsletterEmailMutation error', error)
    return undefined
  }
}
