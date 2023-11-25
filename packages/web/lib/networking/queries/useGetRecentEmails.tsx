import { gql } from "graphql-request"
import useSWR from "swr"
import { publicGqlFetcher } from "../networkHelpers"

export interface RecentEmail {
  id: string
  from: string
  to: string
  subject: string
  type: string
  text: string
  html: string
  createdAt: string
}

interface RecentEmailsResponse {
  isValidating: boolean
  recentEmails: RecentEmail[]
  revalidate: () => void
}

interface RecentEmailsResponseData {
  recentEmails: RecentEmailsData
}

interface RecentEmailsData {
  recentEmails: RecentEmail[]
}

export function useGetRecentEmailsQuery(): RecentEmailsResponse {
  const query = gql`
    query GetRecentEmails {
      recentEmails {
        ... on RecentEmailsSuccess {
          recentEmails {
            id
            from
            to
            subject
            type
            text
            html
            createdAt
          }
        }
        ... on RecentEmailsError {
          errorCodes
        }
      }
    }
  `

  const { data, mutate, error, isValidating } = useSWR(query, publicGqlFetcher)

  try {
    if (error) {
      throw error
    }

    if (data) {
      const result = data as RecentEmailsResponseData
      const recentEmails = result.recentEmails.recentEmails as RecentEmail[]
      return {
        isValidating,
        recentEmails,
        revalidate: () => {
          mutate()
        },
      }
    }
  } catch (error) {
    console.log('error', error)
  }
  return {
    isValidating: true,
    recentEmails: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    revalidate: () => {},
  }
}
