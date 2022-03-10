import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export async function setLabelsMutation(
  linkId: string,
  labelIds: string[]
): Promise<unknown | undefined> {
  const mutation = gql`
    mutation SetLabels($input: SetLabelsInput!) {
      setLabels(input: $input) {
        ... on SetLabelsSuccess {
          labels {
            id
          }
        }
        ... on SetLabelsError {
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, { input: { linkId, labelIds } })
    console.log(data)
    return data
  } catch (error) {
    console.log('SetLabelsOutput error', error)
    return undefined
  }
}
