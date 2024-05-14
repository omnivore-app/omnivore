import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'
import {
  DigestChannel,
  DigestConfig,
  UserPersonalization,
  isDigestConfig,
} from '../queries/useGetUserPersonalization'

type EmptyTrashResult = {
  updatedUserPersonalization?: UserPersonalization
  errorCodes?: string[]
}

type SetUserPersonalizationResponse = {
  setUserPersonalization: EmptyTrashResult
}

export async function updateDigestConfigMutation(
  channels: DigestChannel[]
): Promise<DigestConfig | undefined> {
  const mutation = gql`
    mutation SetUserPersonalization($input: SetUserPersonalizationInput!) {
      setUserPersonalization(input: $input) {
        ... on SetUserPersonalizationError {
          errorCodes
        }
        ... on SetUserPersonalizationSuccess {
          updatedUserPersonalization {
            digestConfig {
              channels
            }
          }
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, {
      input: {
        digestConfig: {
          channels: channels,
        },
      },
    })) as SetUserPersonalizationResponse

    const digestConfig =
      data.setUserPersonalization.updatedUserPersonalization?.digestConfig
    if (isDigestConfig(digestConfig)) {
      return digestConfig
    }
    return undefined
  } catch (err) {
    console.log('error updating user config', err)
    return undefined
  }
}
