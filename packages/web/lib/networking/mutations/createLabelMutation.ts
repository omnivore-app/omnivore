import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export async function createLabelMutation(
  name: string,
  color: string,
  description?: string
): Promise<unknown | undefined> {
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
    const data = await gqlFetcher(mutation)
    console.log('created label', data)
    return data
  } catch (error) {
    console.log('createLabelMutation error', error)
    return undefined
  }
}
