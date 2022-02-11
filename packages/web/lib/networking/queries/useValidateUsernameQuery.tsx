import { gql } from 'graphql-request'
import useSWR from 'swr'
import { makePublicGqlFetcher } from '../networkHelpers'

type ValidateUsernameInput = {
  username: string
}

type ValidateUsernameResponse = {
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

  const { data } = useSWR([query, username], makePublicGqlFetcher({ username }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isUsernameValid = (data as any)?.validateUsername ?? false
  const usernameErrorMessage = validationErrorMessage(username)

  if (usernameErrorMessage) {
    return {
      isUsernameValid: false,
      usernameErrorMessage,
    }
  }

  if (isUsernameValid) {
    return { isUsernameValid }
  }

  return {
    isUsernameValid: false,
    usernameErrorMessage: 'This username is not available',
  }
}

function validationErrorMessage(username: string): string | undefined {
  if (username.length === 0) {
    return undefined
  }

  if (username.length < 3) {
    return 'Username should contain at least three characters'
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
