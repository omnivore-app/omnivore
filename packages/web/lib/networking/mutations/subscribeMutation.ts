import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Subscription } from '../queries/useGetSubscriptionsQuery'

type SubscribeResult = {
  subscribe: Subscribe
  errorCodes?: unknown[]
}

type Subscribe = {
  subscriptions: Subscription[]
}

export async function subscribeMutation(
  subscribeName: string
): Promise<any | undefined> {
  const mutation = gql`
    mutation {
      subscribe(name: "${subscribeName}") {
        ... on SubscribeSuccess {
          subscriptions {
              id
           }
        }
        ... on SubscribeError {
          errorCodes
        }
      }
    }
  `
  try {
    const data = (await gqlFetcher(mutation)) as SubscribeResult
    return data.errorCodes ? undefined : data.subscribe
  } catch (error) {
    console.log('subscribeMutation error', error)
    return undefined
  }
}
