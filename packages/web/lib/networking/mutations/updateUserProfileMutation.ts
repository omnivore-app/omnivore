import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type UpdateUserProfileInput = {
  userId: string
  username: string
}

export async function updateUserProfileMutation(
  input: UpdateUserProfileInput
): Promise<string | undefined> {
  const mutation = gql`
    mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
      updateUserProfile(input: $input) {
        ... on UpdateUserProfileSuccess {
          user {
            profile {
              username
            }
          }
        }
        ... on UpdateUserProfileError {
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
    console.log('output: ', output)
    return output.updateUserProfile.user.profile.username
  } catch (err) {
    return undefined
  }
}
