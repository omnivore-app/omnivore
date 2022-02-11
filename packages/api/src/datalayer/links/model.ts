/* eslint-disable @typescript-eslint/naming-convention */
import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *            Column                       |           Type           | Collation | Nullable |       Default
 *  ---------------------------------------+--------------------------+-----------+----------+----------------------
 *   id                                    | uuid                     |           | not null | uuid_generate_v1mc()
 *   user_id                               | uuid                     |           | not null |
 *   article_id                            | uuid                     |           | not null |
 *   article_url                           | text                     |           | not null |
 *   slug                                  | text                     |           | not null |
 *   article_hash                          | text                     |           | not null |
 *   created_at                            | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   updated_at                            | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   shared_at                             | timestamp with time zone |           |          |
 *   shared_comment                        | text                     |           |          |
 *   article_reading_progress              | real                     |           | not null | 0
 *   article_reading_progress_anchor_index | integer                  |           | not null | 0
 *   saved_at                              | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   shared_with_highlights                | boolean                  |           |          | false
 * ```
 * */
export interface UserArticleData {
  id: string
  userId: string
  articleId: string
  slug: string
  articleUrl: string
  articleHash: string
  createdAt: Date
  updatedAt: Date
  savedAt: Date
  sharedAt?: Date | null
  archivedAt?: Date | null
  sharedComment?: string | null
  articleReadingProgress: number
  articleReadingProgressAnchorIndex: number
  sharedWithHighlights?: boolean
  isArchived: boolean
}

export interface UserFeedArticleData {
  id: string
  userId: string
  articleId: string
  sharedAt: Date
  createdAt: Date
  sharedComment?: string | null
  sharedWithHighlights?: boolean
}

export const keys = [
  'id',
  'userId',
  'articleId',
  'slug',
  'articleUrl',
  'articleHash',
  'createdAt',
  'updatedAt',
  'savedAt',
  'sharedAt',
  'archivedAt',
  'sharedComment',
  'articleReadingProgress',
  'articleReadingProgressAnchorIndex',
  'sharedWithHighlights',
] as const

export const defaultedKeys = [
  'id',
  'createdAt',
  'updatedAt',
  'savedAt',
  'articleReadingProgress',
  'articleReadingProgressAnchorIndex',
  'articleDeleted',
  'sharedWithHighlights',
] as const

type DefaultedSet = PickTuple<UserArticleData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<UserArticleData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = [
  'slug',
  'savedAt',
  'articleId',
  'articleUrl',
  'articleHash',
  'sharedAt',
  'archivedAt',
  'sharedComment',
  'articleReadingProgress',
  'articleReadingProgressAnchorIndex',
  'sharedWithHighlights',
] as const

export type UpdateSet = Partialize<
  PickTuple<UserArticleData, typeof updateKeys>
>

export const getByParametersKeys = exclude(keys, ['id'] as const)

export type ParametersSet = PickTuple<
  UserArticleData,
  typeof getByParametersKeys
>
