import { gqlFetcher } from '../networkHelpers'

type MarkEmailAsItemDataResponseData = {
  markEmailAsItem?: MarkEmailAsItemData
}

type MarkEmailAsItemData = {
  success: Boolean
  errorCodes?: unknown[]
}

export async function markEmailAsItemMutation(
  recentEmailId: String
): Promise<void> {
  const mutation = `
    mutation MarkRecentEmailAsItem($recentEmailId: ID!) {
      markEmailAsItem(recentEmailId:$recentEmailId) {
        ... on MarkEmailAsItemError {
          errorCodes
        }
        ... on MarkEmailAsItemSuccess {
          success
        }
      }
    }`

  const data = await gqlFetcher(mutation, { recentEmailId })
  console.log('recentEmailId: ', data)
  const output = data as MarkEmailAsItemDataResponseData | undefined
  const error = output?.markEmailAsItem?.errorCodes?.find(() => true)
  console.log('error: ', error)
  if (error) {
    throw error
  }
}
