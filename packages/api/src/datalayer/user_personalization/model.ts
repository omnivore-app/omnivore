/* eslint-disable @typescript-eslint/naming-convention */
import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *         Column        |           Type           | Collation | Nullable |       Default
 *  ---------------------+--------------------------+-----------+----------+----------------------
 *   id                  | uuid                     |           | not null | uuid_generate_v1mc()
 *   user_id             | uuid                     |           | not null |
 *   font_size           | integer                  |           |          |
 *   font_family         | text                     |           |          |
 *   theme               | text                     |           |          |
 *   created_at          | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   updated_at          | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 *   margin              | integer                  |           |          |
 *   library_layout_type | text                     |           |          |
 *   library_sort_order  | text                     |           |          |
 * ```
 * */
export interface UserPersonalizationData {
  id: string
  userId: string
  fontFamily?: string | null
  fontSize?: number | null
  margin?: number | null
  theme?: string | null
  libraryLayoutType?: string | null
  librarySortOrder?: string | null
  createdAt: Date
  updatedAt: Date
}

export const keys = [
  'id',
  'userId',
  'fontSize',
  'fontFamily',
  'margin',
  'theme',
  'libraryLayoutType',
  'librarySortOrder',
  'createdAt',
  'updatedAt',
] as const

export const defaultedKeys = ['id', 'createdAt', 'updatedAt'] as const

type DefaultedSet = PickTuple<UserPersonalizationData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<UserPersonalizationData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = [
  'fontSize',
  'fontFamily',
  'margin',
  'theme',
  'libraryLayoutType',
  'librarySortOrder',
] as const

export type UpdateSet = PickTuple<UserPersonalizationData, typeof updateKeys>

export const getByParametersKeys = exclude(keys, ['id'] as const)

export type ParametersSet = PickTuple<
  UserPersonalizationData,
  typeof getByParametersKeys
>
