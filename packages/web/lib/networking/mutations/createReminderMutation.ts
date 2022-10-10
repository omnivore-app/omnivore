import { gql } from 'graphql-request'
import { gqlFetcher } from '../networkHelpers'

export enum ReminderType {
  Tonight = 'TONIGHT',
  Tomorrow = 'TOMORROW',
  ThisWeekend = 'THIS_WEEKEND',
  NextWeek = 'NEXT_WEEK',
}

export async function createReminderMutation(
  linkId: string,
  reminderType: ReminderType,
  archiveUntil: boolean,
  sendNotification: boolean
): Promise<string | undefined> {
  const mutation = gql`
    mutation createReminderMutation($input: CreateReminderInput!) {
      createReminder(input: $input) {
        ... on CreateReminderSuccess {
          reminder {
            id
            remindAt
          }
        }
        ... on CreateReminderError {
          errorCodes
        }
      }
    }
  `

  try {
    const input = {
      linkId,
      reminderType,
      archiveUntil,
      sendNotification,
      scheduledAt: new Date(),
    }
    const data = await gqlFetcher(mutation, { input })
    console.log('created reminder', data)
    return 'data'
  } catch (error) {
    console.log('createReminder error', error)
    return undefined
  }
}
