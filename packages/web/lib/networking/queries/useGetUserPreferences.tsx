import { gql } from 'graphql-request'
import useSWR, { mutate } from 'swr'
import { gqlFetcher } from '../networkHelpers'
import { applyStoredTheme, updateThemeLocally } from '../../themeUpdater'
import { ThemeId } from '../../../components/tokens/stitches.config'

type UserPreferencesResponse = {
  preferencesData?: UserPreferences
  preferencesDataError?: unknown
  isLoading: boolean
  isValidating: boolean
}

type QueryResponse = {
  getUserPersonalization: InnerQueryReponse
}

type InnerQueryReponse = {
  userPersonalization: UserPreferences
}

export type UserPreferences = {
  id: string
  theme: string
  fontSize: number
  fontFamily: string
  margin: number
  lineHeight?: number
  libraryLayoutType: string
  librarySortOrder?: SortOrder
}

export type SortOrder = 'ASCENDING' | 'DESCENDING'

const QUERY = gql`
  query GetUserPersonalization {
    getUserPersonalization {
      ... on GetUserPersonalizationSuccess {
        userPersonalization {
          id
          theme
          margin
          fontSize
          fontFamily
          libraryLayoutType
          librarySortOrder
        }
      }
      ... on GetUserPersonalizationError {
        errorCodes
      }
    }
  }
`

export function updateUserPreferencesCache(
  userPersonalization: UserPreferences
): void {
  mutate(
    QUERY,
    {
      getUserPersonalization: { userPersonalization },
    },
    false
  )
}

export function useGetUserPreferences(): UserPreferencesResponse {
  const currentTheme = applyStoredTheme(false)
  const { data, error, isValidating } = useSWR(QUERY, gqlFetcher, {
    dedupingInterval: 200000,
  })

  const preferencesData = (data as QueryResponse | undefined)
    ?.getUserPersonalization.userPersonalization

  const serverThemeKey = preferencesData?.theme as ThemeId | undefined
  if (!isValidating && serverThemeKey && currentTheme !== serverThemeKey) {
    updateThemeLocally(serverThemeKey)
  }

  return {
    preferencesData,
    isValidating,
    preferencesDataError: error, // TODO: figure out error possibilities
    isLoading: !error && !data,
  }
}
