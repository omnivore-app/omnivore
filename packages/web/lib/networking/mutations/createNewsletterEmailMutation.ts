import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { NewsletterEmail } from '../queries/useGetNewsletterEmailsQuery'

type CreateNewsletterEmailResult = {
  createNewsletterEmail: CreateNewsletterEmail
  errorCodes?: unknown[]
}

type CreateNewsletterEmail = {
  newsletterEmail: NewsletterEmail
}

export async function createNewsletterEmailMutation(): Promise<
  string | undefined
> {
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
    const data = (await gqlFetcher(mutation)) as CreateNewsletterEmailResult
    return data.errorCodes
      ? undefined
      : data.createNewsletterEmail.newsletterEmail.id
  } catch (error) {
    console.log('createNewsletterEmailMutation error', error)
    return undefined
  }
}
