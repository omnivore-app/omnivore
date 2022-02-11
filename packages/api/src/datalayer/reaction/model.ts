import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *      Column          |           Type           | Collation | Nullable |       Default
 *  --------------------+--------------------------+-----------+----------+----------------------
 *   id                 | uuid                     |           | not null | uuid_generate_v1mc()
 *   user_id            | uuid                     |           | not null |
 *   user_article_id    | uuid                     |           |          |
 *   highlight_id       | uuid                     |           |          |
 *   highlight_reply_id | uuid                     |           |          |
 *   code               | varchar(50)              |           | not null |
 *   deleted            | boolean                  |           | not null | false
 *   created_at         | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   updated_at         | timestamp with time zone |           |          |
 * ```
 * */

export interface ReactionData {
  id: string
  userId: string
  userArticleId?: string | null
  highlightId?: string | null
  highlightReplyId?: string | null
  code: string
  deleted: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export const keys = [
  'id',
  'userId',
  'userArticleId',
  'highlightId',
  'highlightReplyId',
  'code',
  'deleted',
  'createdAt',
  'updatedAt',
] as const

export const defaultedKeys = [
  'id',
  'createdAt',
  'updatedAt',
  'deleted',
] as const

type DefaultedSet = PickTuple<ReactionData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<ReactionData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = ['code'] as const

export type UpdateSet = Partialize<PickTuple<ReactionData, typeof updateKeys>>
