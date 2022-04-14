/* eslint-disable @typescript-eslint/naming-convention */
import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *          Column           |           Type            | Collation | Nullable |          Default
 * ---------------------------+--------------------------+-----------+----------+----------------------------
 *  id                        | uuid                     |           | not null | uuid_generate_v1mc()
 *  user_id                   | uuid                     |           | not null |
 *  article_saving_request_id | uuid                     |           |          |
 *  link_id                   | uuid                     |           |          |
 *  task_name                 | text                     |           |          |
 *  type                      | reminder_type            |           | not null |
 *  status                    | reminder_status          |           | not null | 'CREATED'::reminder_status
 *  created_at                | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *  updated_at                | timestamp with time zone |           |          |
 *  remind_at                 | timestamp with time zone |           | not null |
 *  archive_until             | boolean                  |           | not null | false
 *  send_notification         | boolean                  |           | not null | true
 * ```
 * */
export interface ReminderData {
  id: string
  userId: string
  articleSavingRequestId?: string
  linkId?: string
  archiveUntil?: boolean
  sendNotification?: boolean
  taskName?: string
  type: string
  status?: string
  createdAt: Date
  updatedAt?: Date
  remindAt: Date
  elasticPageId?: string
}

export const keys = [
  'id',
  'userId',
  'articleSavingRequestId',
  'linkId',
  'archiveUntil',
  'sendNotification',
  'taskName',
  'remindAt',
  'status',
  'createdAt',
  'updatedAt',
  'elasticPageId',
] as const

export const defaultedKeys = ['id', 'updatedAt', 'status'] as const

type DefaultedSet = PickTuple<ReminderData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<ReminderData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = [
  'taskName',
  'remindAt',
  'status',
  'sendNotification',
  'archiveUntil',
] as const

export type UpdateSet = PickTuple<ReminderData, typeof updateKeys>

export const getByParametersKeys = exclude(keys, ['id'] as const)

export type ParametersSet = PickTuple<ReminderData, typeof getByParametersKeys>
