import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *      Column     |           Type           | Collation | Nullable |       Default
 *  ---------------+--------------------------+-----------+----------+----------------------
 *   id            | uuid                     |           | not null | uuid_generate_v1mc()
 *   short_id      | varchar(14)              |           | not null |
 *   user_id       | uuid                     |           | not null |
 *   article_id    | uuid                     |           | not null |
 *   quote         | text                     |           | not null |
 *   prefix        | varchar(5000)            |           |          |
 *   suffix        | varchar(5000)            |           |          |
 *   patch         | text                     |           | not null |
 *   annotation    | text                     |           |          |
 *   deleted       | boolean                  |           | not null | false
 *   created_at    | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   updated_at    | timestamp with time zone |           |          |
 *   shared_at     | timestamp with time zone |           |          |
 * ```
 * */

export interface HighlightData {
  id: string
  shortId: string
  userId: string
  articleId: string
  quote: string
  prefix?: string | null
  suffix?: string | null
  patch: string
  annotation?: string | null
  deleted: boolean
  createdAt: Date
  updatedAt?: Date | null
  sharedAt?: Date | null
}

export const keys = [
  'id',
  'shortId',
  'userId',
  'articleId',
  'quote',
  'prefix',
  'suffix',
  'patch',
  'annotation',
  'deleted',
  'createdAt',
  'updatedAt',
  'sharedAt',
] as const

export const defaultedKeys = [
  'createdAt',
  'updatedAt',
  'sharedAt',
  'deleted',
] as const

type DefaultedSet = PickTuple<HighlightData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<HighlightData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = ['annotation', 'sharedAt'] as const

export type UpdateSet = Partialize<PickTuple<HighlightData, typeof updateKeys>>
