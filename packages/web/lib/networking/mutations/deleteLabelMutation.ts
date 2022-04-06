import { gql } from 'graphql-request'
import { Label } from '../fragments/labelFragment'
import { gqlFetcher } from '../networkHelpers'

type DeleteLabelResult = {
  deleteLabel: DeleteLabel
  errorCodes?: unknown[]
}

type DeleteLabel = {
  label: Label
}

export async function deleteLabelMutation(
  labelId: string
): Promise<any | undefined> {
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
    const data = await gqlFetcher(mutation) as DeleteLabelResult
    return data.errorCodes ? undefined : data.deleteLabel.label.id
  } catch (error) {
    console.log('deleteLabelMutation error', error)
    return undefined
  }
}
