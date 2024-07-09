import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type UpdateLabelInput = {
  labelId: string
  name: string
  color: string
  description?: string
}

export async function updateLabelMutation(
  input: UpdateLabelInput
): Promise<string | undefined> {
  const mutation = gql`
    mutation UpdateLabel($input: UpdateLabelInput!) {
      updateLabel(input: $input) {
        ... on UpdateLabelSuccess {
          label {
            id
            name
            color
            description
            createdAt
          }
        }
        ... on UpdateLabelError {
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
    return output?.updatedLabel
  } catch (err) {
    return undefined
  }
}
