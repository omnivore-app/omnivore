import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type SetLinkArchivedInput = {
  linkId: string
  archived: boolean
}

export async function setLinkArchivedMutation(
  input: SetLinkArchivedInput
): Promise<Record<string, never> | undefined> {
  const mutation = gql`
    mutation SetLinkArchived($input: ArchiveLinkInput!) {
      setLinkArchived(input: $input) {
        ... on ArchiveLinkSuccess {
          linkId
          message
        }
        ... on ArchiveLinkError {
          message
          errorCodes
        }
      }
    }
  `

  try {
    const data = await gqlFetcher(mutation, { input })
    return data as Record<string, never> | undefined
  } catch (error) {
    console.log('SetLinkArchivedInput error', error)
    return undefined
  }
}
