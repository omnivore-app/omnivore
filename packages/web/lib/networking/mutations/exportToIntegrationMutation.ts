import { gqlFetcher } from '../networkHelpers'

export interface Task {
  id: string
  state: string
  createdAt: Date
  name: string
  runningTime: number
  progress: number
  failedReason?: string
}

interface ExportToIntegrationDataResponseData {
  exportToIntegration: {
    Task: Task
    errorCodes?: string[]
  }
}

export async function exportToIntegrationMutation(integrationId: string) {
  const mutation = `
    mutation ExportToIntegration($integrationId: ID!) {
      exportToIntegration(integrationId:$integrationId) {
        ... on ExportToIntegrationError {
          errorCodes
        }
        ... on ExportToIntegrationSuccess {
          Task {
            id
          }
        }
      }
    }`

  const data = await gqlFetcher(mutation, { integrationId })
  const output = data as ExportToIntegrationDataResponseData
  const error = output.exportToIntegration.errorCodes?.find(() => true)
  if (error) {
    throw error
  }

  return output.exportToIntegration.Task
}
