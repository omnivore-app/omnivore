import { gql } from 'graphql-request'
import { Feature, featureFragment } from '../fragments/featureFragment'
import { gqlFetcher } from '../networkHelpers'

export interface OptInFeatureInput {
  name: string
}

export interface OptInFeatureResponse {
  feature?: Feature
}

interface Response {
  optInFeature: OptInFeatureResponse
}

export async function optInFeature(
  input: OptInFeatureInput
): Promise<boolean | undefined> {
  const mutation = gql`
    mutation OptInFeature($input: OptInFeatureInput!) {
      optInFeature(input: $input) {
        ... on OptInFeatureSuccess {
          feature {
            ...FeatureFields
          }
        }
        ... on OptInFeatureError {
          errorCodes
        }
      }
    }
    ${featureFragment}
  `
  try {
    const data = await gqlFetcher(mutation, {
      input,
    })
    const output = data as Response | undefined
    if (
      !output ||
      !output.optInFeature.feature ||
      !output.optInFeature.feature.grantedAt
    ) {
      return false
    }
    return true
  } catch (err) {
    return undefined
  }
}
