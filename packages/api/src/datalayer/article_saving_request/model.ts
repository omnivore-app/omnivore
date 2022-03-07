/* eslint-disable @typescript-eslint/naming-convention */
import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *     Column   |           Type           | Collation | Nullable |       Default
 *  ------------+--------------------------+-----------+----------+----------------------
 *   id         | uuid                     |           | not null | uuid_generate_v1mc()
 *   user_id    | uuid                     |           | not null |
 *   article_id | uuid                     |           |          |
 *   status     | text                     |           |          | 'PROCESSING'::text
 *   error_code | text                     |           |          |
 *   created_at | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   updated_at | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   task_name  | text                     |           |          |
 * ```
 * */
export interface ArticleSavingRequestData {
  id: string
  userId: string
  articleId?: string | null
  status?: string | null
  errorCode?: string | null
  createdAt: Date
  updatedAt: Date
  taskName?: string
  elasticPageId?: string
}

export const keys = [
  'id',
  'userId',
  'articleId',
  'status',
  'errorCode',
  'createdAt',
  'updatedAt',
  'taskName',
  'elasticPageId',
] as const

export const defaultedKeys = ['id', 'createdAt', 'updatedAt', 'status'] as const

type DefaultedSet = PickTuple<ArticleSavingRequestData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<ArticleSavingRequestData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = [
  'articleId',
  'status',
  'errorCode',
  'taskName',
  'elasticPageId',
] as const

export type UpdateSet = PickTuple<ArticleSavingRequestData, typeof updateKeys>

export const getByParametersKeys = exclude(keys, ['id'] as const)

export type ParametersSet = PickTuple<
  ArticleSavingRequestData,
  typeof getByParametersKeys
>
