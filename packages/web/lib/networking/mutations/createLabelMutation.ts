import { gql } from 'graphql-request'
import { Label } from '../fragments/labelFragment'
import { gqlFetcher } from '../networkHelpers'

type CreateLabelResult = {
  createLabel: CreateLabel
  errorCodes?: unknown[]
}

type CreateLabel = {
  label: Label
}

export async function createLabelMutation(
  name: string,
  color: string,
  description?: string
): Promise<any | undefined> {
  const mutation = gql`
    mutation CreateLabel($input: CreateLabelInput!) {
      createLabel(input: $input) {
        ... on CreateLabelSuccess {
          label {
            id
            name
            color
            description
            createdAt
          }
        }
        ... on CreateLabelError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = (await gqlFetcher(mutation, {
      input: {
        name,
        color,
        description,
      },
    })) as CreateLabelResult
    return data.errorCodes ? undefined : data.createLabel.label
  } catch (error) {
    console.log('createLabelMutation error', error)
    return undefined
  }
}
