import { gql } from 'graphql-request'
import { Feature, featureFragment } from '../fragments/featureFragment'
import { gqlFetcher } from '../networkHelpers'

export enum OptInFeatureErrorCode {
  BadRequest = 'BAD_REQUEST',
  Ineligible = 'INELIGIBLE',
  NotFound = 'NOT_FOUND',
}

export type OptInResult = {
  feature?: Feature
  ineligible?: boolean
}

export interface OptInFeatureInput {
  name: string
}

interface OptInFeatureResponse {
  feature?: Feature
  errorCodes?: OptInFeatureErrorCode[]
}

interface Response {
  optInFeature: OptInFeatureResponse
}

export async function optInFeature(
  input: OptInFeatureInput
): Promise<OptInResult> {
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
    console.log('output: ', output, output?.optInFeature?.errorCodes)
    if (
      output?.optInFeature?.errorCodes &&
      output.optInFeature?.errorCodes?.indexOf(
        OptInFeatureErrorCode.Ineligible
      ) !== -1
    ) {
      return {
        ineligible: true,
      }
    }
    if (
      !output ||
      !output.optInFeature.feature ||
      !output.optInFeature.feature.grantedAt
    ) {
      return {}
    }
    return {
      feature: output.optInFeature.feature,
    }
  } catch (err) {
    console.log('error opting into feature')
    return {}
  }
}
