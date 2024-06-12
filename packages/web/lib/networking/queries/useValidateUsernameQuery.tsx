import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makePublicGqlFetcher } from '../networkHelpers'

type ValidateUsernameInput = {
  username: string
}

type ValidateUsernameResponse = {
  isLoading: boolean
  isUsernameValid: boolean
  usernameErrorMessage?: string
}

export function useValidateUsernameQuery({
  username,
}: ValidateUsernameInput): ValidateUsernameResponse {
  const query = gql`
    query ValidateUsername($username: String!) {
      validateUsername(username: $username)
    }
  `

  // Don't fetch if username is empty
  const { data, error, isValidating } = useSWR(
    username ? [query, username] : null,
    makePublicGqlFetcher(query, { username }),
    {}
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isUsernameValid = (data as any)?.validateUsername ?? false
  if (isUsernameValid) {
    return {
      isUsernameValid,
      isLoading: !data && !error,
    }
  }

  // Try to figure out why the username is invalid
  const usernameErrorMessage = validationErrorMessage(username.toLowerCase())
  if (usernameErrorMessage) {
    return {
      isUsernameValid: false,
      isLoading: !data && !error,
      usernameErrorMessage,
    }
  }

  return {
    isUsernameValid: false,
    isLoading: !data && !error,
    usernameErrorMessage: 'This username is not available',
  }
}

function validationErrorMessage(username: string): string | undefined {
  if (username.length === 0) {
    return undefined
  }

  if (username.length < 4) {
    return 'Username should contain at least four characters'
  }

  if (username.length > 15) {
    return 'Username cannot be longer than fifteen characters'
  }

  const regex = /^[a-z0-9][a-z0-9_]+[a-z0-9]$/
  if (!regex.test(username)) {
    return 'Username can only contain letters, numbers and underscores in the middle'
  }

  return undefined
}
