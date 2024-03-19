import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export interface OptInFeatureInput {
  name: string
}

export interface OptInFeatureSuccess {
  feature: { id: string }
}

interface Response {
  optInFeature: OptInFeatureSuccess
}

export async function optInFeature(
  input: OptInFeatureInput
): Promise<boolean | undefined> {
  const mutation = gql`
    mutation OptInFeature($input: OptInFeatureInput!) {
      optInFeature(input: $input) {
        ... on OptInFeatureSuccess {
          feature {
            id
          }
        }
        ... on OptInFeatureError {
          errorCodes
        }
      }
    }
  `
  try {
    const data = await gqlFetcher(mutation, {
      input,
    })
    const output = data as Response | undefined
    if (
      !output ||
      !output.optInFeature ||
      'errorCodes' in output?.optInFeature
    ) {
      return false
    }
    return true
  } catch (err) {
    return undefined
  }
}
