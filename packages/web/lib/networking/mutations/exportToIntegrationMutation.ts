import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export enum TaskState {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Running = 'RUNNING',
  Succeeded = 'SUCCEEDED'
}

export interface Task {
  id: string
  state: TaskState
  createdAt: Date
  name: string
  runningTime: number
  progress: number
  failedReason?: string
}

interface ExportToIntegrationDataResponseData {
  exportToIntegration: {
    task: Task
    errorCodes?: string[]
  }
}

export async function exportToIntegrationMutation(integrationId: string) {
  const mutation = gql`
    mutation ExportToIntegration($integrationId: ID!) {
      exportToIntegration(integrationId: $integrationId) {
        ... on ExportToIntegrationError {
          errorCodes
        }
        ... on ExportToIntegrationSuccess {
          task {
            id
          }
        }
      }
    }
  `

  const data = await gqlFetcher(mutation, { integrationId })
  const output = data as ExportToIntegrationDataResponseData
  const error = output.exportToIntegration.errorCodes?.find(() => true)
  if (error) {
    throw error
  }

  return output.exportToIntegration.task
}
