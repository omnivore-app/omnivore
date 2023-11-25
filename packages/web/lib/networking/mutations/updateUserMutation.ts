import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type UpdateUserInput = {
  name: string
  bio: string
}

export async function updateUserMutation(
  input: UpdateUserInput
): Promise<string | undefined> {
  const mutation = gql`
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
        ... on UpdateUserSuccess {
          user {
            name
          }
        }
        ... on UpdateUserError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, {
      input,
    })
    const output = data as any
    return output.updateUser.user.name
  } catch (err) {
    return undefined
  }
}
