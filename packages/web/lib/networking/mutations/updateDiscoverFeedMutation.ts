import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

interface UpdateDiscoverFeedResult {
  editDiscoverFeed: UpdateDiscoverFeed
}

export enum UpdateSubscriptionErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
}

interface UpdateDiscoverFeed {
  id?: string
  errorCodes?: UpdateSubscriptionErrorCode[]
}

export interface UpdateDiscoverFeedInput {
  feedId: string
  name?: string
}

export async function updateDiscoverFeedMutation(
  input: UpdateDiscoverFeedInput,
): Promise<UpdateDiscoverFeedResult> {
  const mutation = gql`
    mutation UpdateDiscoverFeed($input: EditDiscoverFeedInput!) {
      editDiscoverFeed(input: $input) {
        ... on EditDiscoverFeedSuccess {
          id
        }
        ... on EditDiscoverFeedError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, {
      input,
    })) as UpdateDiscoverFeedResult
    return data
  } catch (error) {
    console.log('updateDiscoverFeed error', error)
    return {
      editDiscoverFeed: {
        errorCodes: [UpdateSubscriptionErrorCode.BadRequest],
      },
    }
  }
}
