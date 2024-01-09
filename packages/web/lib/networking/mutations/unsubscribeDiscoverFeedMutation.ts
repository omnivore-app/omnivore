import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type DeleteDiscoverFeedResult = {
  deleteDiscoverFeed: DeleteDiscoverFeed
}

type DeleteDiscoverFeed = {
  id: string
  errorCodes?: unknown[]
}

export async function unsubscribeDiscoverFeedMutation(
  feedId: string,
): Promise<any | undefined> {
  const mutation = gql`
    mutation UnsubscribeDiscoverFeed($input: DeleteDiscoverFeedInput!) {
      deleteDiscoverFeed(input: $input) {
        ... on DeleteDiscoverFeedSuccess {
          id
        }
        ... on DeleteDiscoverFeedError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, {
      input: { feedId },
    })) as DeleteDiscoverFeedResult
    return data.deleteDiscoverFeed.errorCodes
      ? undefined
      : data.deleteDiscoverFeed.id
  } catch (error) {
    console.log('unsubscribeMutation error', error)
    return undefined
  }
}
