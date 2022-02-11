import { gql } from 'graphql-request'
import { publicGqlFetcher } from '../networkHelpers'

type ReportIssueMutationInput = {
  pageId: string
  itemUrl: string
  sharedBy?: string
  reportTypes: string[]
  reportComment: string
}

export async function reportIssueMutation(
  input: ReportIssueMutationInput
): Promise<boolean> {
  const mutation = gql`
    mutation ReportItem($input: ReportItemInput!) {
      reportItem(input: $input) {
        ... on ReportItemResult {
          message
        }
      }
    }
  `

  try {
    await publicGqlFetcher(mutation, { input })
    return true
  } catch {
    return false
  }
}
