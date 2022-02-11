import { gql } from 'graphql-request'
import {
  UserPreferences,
  SortOrder,
  updateUserPreferencesCache,
} from '../queries/useGetUserPreferences'
import { gqlFetcher } from '../networkHelpers'

type UserPersonalizationInput = {
  theme?: string
  fontSize?: number
  fontFamily?: string
  margin?: number
  libraryLayoutType?: string
  librarySortOrder?: SortOrder
}

type SetUserPersonalizationResult = {
  setUserPersonalization: InnerSetUserPersonalization
}

type InnerSetUserPersonalization = {
  updatedUserPersonalization?: UserPreferences
}

export async function userPersonalizationMutation(
  input: UserPersonalizationInput
): Promise<UserPreferences | undefined> {
  const mutation = gql`
    mutation SetUserPersonalization($input: SetUserPersonalizationInput!) {
      setUserPersonalization(input: $input) {
        ... on SetUserPersonalizationSuccess {
          updatedUserPersonalization {
            id
            theme
            fontSize
            fontFamily
            margin
            libraryLayoutType
            librarySortOrder
          }
        }
        ... on SetUserPersonalizationError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, { input })
    const result =  data as SetUserPersonalizationResult | undefined
    if (result?.setUserPersonalization?.updatedUserPersonalization) {
      updateUserPreferencesCache(result.setUserPersonalization.updatedUserPersonalization)
      return result.setUserPersonalization?.updatedUserPersonalization
    }
    return undefined
  } catch {
    return undefined
  }
}
