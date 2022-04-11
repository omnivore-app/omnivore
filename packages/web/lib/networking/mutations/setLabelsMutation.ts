import { gql } from 'graphql-request'
import { Label, labelFragment } from '../fragments/labelFragment'
import { gqlFetcher } from '../networkHelpers'

type SetLabelsResult = {
  setLabels: SetLabels
  errorCodes?: unknown[]
}

type SetLabels = {
  labels: Label[]
}

export async function setLabelsMutation(
  linkId: string,
  labelIds: string[]
): Promise<Label[] | undefined> {
  const mutation = gql`
    mutation SetLabels($input: SetLabelsInput!) {
      setLabels(input: $input) {
        ... on SetLabelsSuccess {
          labels {
            ...LabelFields
          }
        }
        ... on SetLabelsError {
          errorCodes
        }
      }
    }
    ${labelFragment}
  `

  try {
    const data = await gqlFetcher(mutation, { input: { linkId, labelIds } }) as SetLabelsResult
    return data.errorCodes ? undefined : data.setLabels.labels
  } catch (error) {
    console.log('SetLabelsOutput error', error)
    return undefined
  }
}
