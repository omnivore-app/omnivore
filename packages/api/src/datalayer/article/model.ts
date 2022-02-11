/* eslint-disable @typescript-eslint/naming-convention */
import { ContentReader, PageType } from '../../generated/graphql'
import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *      Column     |           Type           | Collation | Nullable |       Default
 *  ---------------+--------------------------+-----------+----------+----------------------
 *   id            | uuid                     |           | not null | uuid_generate_v1mc()
 *   title         | text                     |           | not null |
 *   description   | text                     |           |          |
 *   created_at    | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   published_at  | timestamp with time zone |           |          |
 *   url           | text                     |           | not null |
 *   hash          | text                     |           | not null |
 *   original_html | text                     |           |          |
 *   content       | text                     |           | not null |
 *   author        | text                     |           |          |
 *   image         | text                     |           |          |
 *   upload_file_id| uuid reference           |           |          |
 * ```
 * */

export interface ArticleData {
  id: string
  title: string
  description?: string | null
  createdAt: Date
  publishedAt?: Date | null
  url: string
  hash: string
  originalHtml?: string | null
  content: string
  pageType: PageType
  author?: string | null
  image?: string | null
  uploadFileId?: string | null
  contentReader: ContentReader
}

export const keys = [
  'id',
  'title',
  'description',
  'createdAt',
  'publishedAt',
  'url',
  'hash',
  'originalHtml',
  'content',
  'pageType',
  'author',
  'image',
  'uploadFileId',
] as const

export const defaultedKeys = ['id', 'createdAt'] as const

type DefaultedSet = PickTuple<ArticleData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<ArticleData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = [] as const

export type UpdateSet = Partialize<PickTuple<ArticleData, typeof updateKeys>>
