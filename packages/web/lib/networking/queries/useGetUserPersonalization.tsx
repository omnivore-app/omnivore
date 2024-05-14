import { gql } from 'graphql-request'
import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'

export type DigestChannel = 'push' | 'email' | 'library'

export type UserPersonalizationResult = {
  mutate: () => void
  isLoading: boolean
  userPersonalization?: UserPersonalization
}

type Response = {
  getUserPersonalization?: Result
}

type Result = {
  userPersonalization?: UserPersonalization
  errorCodes?: string[]
}

export type UserPersonalization = {
  digestConfig?: DigestConfig
}
export type DigestConfig = {
  channels?: DigestChannel[]
}

export function isDigestConfig(obj: any): obj is DigestConfig {
  const validChannels = ['push', 'email', 'library'] as const

  function isValidChannel(channel: any): channel is DigestChannel {
    return validChannels.includes(channel)
  }

  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  if ('channels' in obj) {
    const { channels } = obj
    if (!Array.isArray(channels)) {
      return false
    }
    for (const channel of channels) {
      if (!isValidChannel(channel)) {
        return false
      }
    }
  }

  return true
}

export function useGetUserPersonalization(): UserPersonalizationResult {
  const query = gql`
    query UserPersonalization {
      getUserPersonalization {
        ... on GetUserPersonalizationSuccess {
          userPersonalization {
            digestConfig {
              channels
            }
          }
        }
        ... on GetUserPersonalizationError {
          errorCodes
        }
      }
    }
  `

  const { data, error, mutate } = useSWR(query, publicGqlFetcher)
  const response = data as Response | undefined

  if (
    !response ||
    !response.getUserPersonalization ||
    response.getUserPersonalization?.errorCodes ||
    !response.getUserPersonalization?.userPersonalization ||
    !isDigestConfig(
      response.getUserPersonalization?.userPersonalization.digestConfig
    )
  ) {
    return {
      mutate,
      isLoading: false,
      userPersonalization: undefined,
    }
  }

  return {
    mutate,
    userPersonalization: response.getUserPersonalization?.userPersonalization,
    isLoading: !error && !data,
  }
}
