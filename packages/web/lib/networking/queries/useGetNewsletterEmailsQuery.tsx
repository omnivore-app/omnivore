import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'

type NewsletterEmailsQueryResponse = {
  isValidating: boolean
  emailAddresses: NewsletterEmail[]
  revalidate: () => void
}

type NewsletterEmailsResponseData = {
  newsletterEmails?: NewsletterEmailsData
}

type NewsletterEmailsData = {
  newsletterEmails?: unknown
}

export type NewsletterEmail = {
  id: string
  address: string
  confirmationCode?: string
}

export function useGetNewsletterEmailsQuery(): NewsletterEmailsQueryResponse {
  const query = gql`
    query GetNewsletterEmails {
      newsletterEmails {
        ... on NewsletterEmailsSuccess {
          newsletterEmails {
            id
            address
            confirmationCode
          }
        }

        ... on NewsletterEmailsError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, isValidating } = useSWR(query, publicGqlFetcher)

  try {
    if (data) {
      const result = data as NewsletterEmailsResponseData
      const emailAddresses = result.newsletterEmails?.newsletterEmails as NewsletterEmail[]
      return {
        isValidating,
        emailAddresses,
        revalidate: () => {
          mutate()
        }
      }
    }
  } catch (error) {
    console.log('error', error)
  }
  return {
    isValidating: false,
    emailAddresses: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {}
  }
}
