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
    mutation {
      createLabel(
        input: {
          color: "${color}"
          name: "${name}"
          description: "${description}"
        }
      ) {
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
    const data = (await gqlFetcher(mutation)) as CreateLabelResult
    console.log('created label', data)
    return data.errorCodes ? undefined : data.createLabel.label
  } catch (error) {
    console.log('createLabelMutation error', error)
    return undefined
  }
}
