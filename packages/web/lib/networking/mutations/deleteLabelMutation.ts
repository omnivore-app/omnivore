import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export async function deleteLabelMutation(
  labelId: string
): Promise<unknown | undefined> {
  const mutation = gql`
    mutation {
      deleteLabel(id: "${labelId}") {
        ... on DeleteLabelSuccess {
          label {
            id
            name
            color
            description
            createdAt
          }
        }
        ... on DeleteLabelError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation)
    console.log('deleted label', data)
    return data
  } catch (error) {
    console.log('deleteLabelMutation error', error)
    return undefined
  }
}
