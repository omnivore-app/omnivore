import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

type MoveToFolderResponseData = {
  success?: boolean
  errorCodes?: string[]
}

type MoveToFolderResponse = {
  moveToFolder?: MoveToFolderResponseData
}

export async function moveToFolderMutation(
  itemId: string,
  folder: string
): Promise<boolean> {
  const mutation = gql`
    mutation MoveToFolder($id: ID!, $folder: String!) {
      moveToFolder(id: $id, folder: $folder) {
        ... on MoveToFolderSuccess {
          success
        }
        ... on MoveToFolderError {
          errorCodes
        }
      }
    }
  `

  try {
    const response = await gqlFetcher(mutation, { id: itemId, folder })
    const data = response as MoveToFolderResponse | undefined
    if (data?.moveToFolder?.errorCodes) {
      return false
    }
    return data?.moveToFolder?.success ?? false
  } catch (error) {
    console.log('MoveToFolder error', error)
    return false
  }
}
