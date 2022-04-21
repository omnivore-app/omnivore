import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import { Subscription } from '@omnivore/api/src/generated/graphql'

type UnsubscribeResult = {
  unsubscribe: Unsubscribe
  errorCodes?: unknown[]
}

type Unsubscribe = {
  subscription: Subscription
}

export async function unsubscribeMutation(
  subscribeName: string
): Promise<any | undefined> {
  const mutation = gql`
    mutation {
      unsubscribe(name: "${subscribeName}") {
        ... on UnsubscribeSuccess {
          subscription {
            id
          }
        }
        ... on UnsubscribeError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation)) as UnsubscribeResult
    return data.errorCodes ? undefined : data.unsubscribe.subscription.id
  } catch (error) {
    console.log('unsubscribeMutation error', error)
    return undefined
  }
}
