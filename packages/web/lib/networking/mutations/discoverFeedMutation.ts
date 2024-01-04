import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { DiscoverFeed } from '../queries/useGetDiscoverFeeds'

type DiscoverFeedResult = {
  addDiscoverFeed: {
    feed?: DiscoverFeed
    errorCodes?: DiscoverFeedErrorCode[]
  }
}

enum DiscoverFeedErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
  Conflict = 'CONFLICT',
}

export type AddDiscoverFeedInput = {
  url: string
}

export async function addDiscoverFeedMutation(
  input: AddDiscoverFeedInput,
): Promise<DiscoverFeedResult> {
  const mutation = gql`
    mutation AddDiscoverFeed($input: AddDiscoverFeedInput!) {
      addDiscoverFeed(input: $input) {
        ... on AddDiscoverFeedSuccess {
          feed {
            description
          }
        }
        ... on AddDiscoverFeedError {
          errorCodes
        }
      }
    }
  `
  try {
    const data = (await gqlFetcher(mutation, { input })) as DiscoverFeedResult
    return data
  } catch (error) {
    console.log('subscribeMutation error', error)
    return {
      addDiscoverFeed: {
        errorCodes: [DiscoverFeedErrorCode.BadRequest],
      },
    }
  }
}
