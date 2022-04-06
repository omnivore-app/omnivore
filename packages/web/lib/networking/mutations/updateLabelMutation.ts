import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export type UpdateLabelInput = {
  labelId: string
  name: string,
  color: string,
  description?: string
}

export async function updateLabelMutation(
  input: UpdateLabelInput
): Promise<string | undefined> {
  const mutation = gql`
    mutation {
      updateLabel(
        input: {
          color: "${input.color}"
          name: "${input.name}"
          description: "${input.description}"
          labelId: "${input.labelId}"
        }
      ) {
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
    const data = await gqlFetcher(mutation)
    console.log(input, data);
    const output = data as any
    console.log(output)
    return output?.updatedLabel
  } catch (err) {
    return undefined
  }
}
