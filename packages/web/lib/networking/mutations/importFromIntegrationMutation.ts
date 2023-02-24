import { gqlFetcher } from '../networkHelpers'

interface ImportFromIntegrationDataResponseData {
  importFromIntegration?: ImportFromIntegrationData
}

interface ImportFromIntegrationData {
  count: number
  errorCodes?: unknown[]
}

export async function importFromIntegrationMutation(
  integrationId: string
): Promise<void> {
  const mutation = `
    mutation ImportFromIntegration($integrationId: ID!) {
      importFromIntegration(integrationId:$integrationId) {
        ... on ImportFromIntegrationError {
          errorCodes
        }
        ... on ImportFromIntegrationSuccess {
          count
        }
      }
    }`

  const data = await gqlFetcher(mutation, { integrationId })
  console.log('integrationId: ', data)
  const output = data as ImportFromIntegrationDataResponseData | undefined
  const error = output?.importFromIntegration?.errorCodes?.find(() => true)
  console.log('error: ', error)
  if (error) {
    throw error
  }
}
