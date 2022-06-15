/* eslint-disable @typescript-eslint/naming-convention */
import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *     Column    |           Type           | Collation | Nullable |       Default
 *  -------------+--------------------------+-----------+----------+----------------------
 *   id          | uuid                     |           | not null | uuid_generate_v1mc()
 *   user_id     | uuid                     |           | not null |
 *   url         | text                     |           | not null |
 *   file_name   | text                     |           | not null |
 *   content_type| text                     |           | not null |
 *   status      | upload_status_type (text)|           | not null |
 *   created_at  | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   updated_at  | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 * ```
 * */
export interface UploadFileData {
  id: string
  userId: string
  url: string
  fileName: string
  contentType: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export const keys = [
  'id',
  'userId',
  'url',
  'fileName',
  'contentType',
  'status',
  'createdAt',
  'updatedAt',
] as const

export const defaultedKeys = ['id', 'createdAt', 'updatedAt'] as const

type DefaultedSet = PickTuple<UploadFileData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<UploadFileData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = ['url', 'status'] as const

export type UpdateSet = PickTuple<UploadFileData, typeof updateKeys>

export const getByParametersKeys = exclude(keys, ['id'] as const)

export type ParametersSet = PickTuple<
  UploadFileData,
  typeof getByParametersKeys
>
