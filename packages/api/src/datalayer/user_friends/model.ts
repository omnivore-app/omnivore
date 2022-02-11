/* eslint-disable @typescript-eslint/naming-convention */
import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *      Column     |           Type           | Collation | Nullable |       Default
 *  ---------------+--------------------------+-----------+----------+----------------------
 *   id            | uuid                     |           | not null | uuid_generate_v1mc()
 *   user_id       | uuid                     |           | not null |
 *   friend_user_id| uuid                     |           | not null |
 *   created_at    | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 * ```
 * */
export interface UserFriendData {
  id: string
  userId: string
  friendUserId: string
  createdAt: Date
}

export const keys = ['id', 'userId', 'friendUserId', 'createdAt'] as const

export const defaultedKeys = ['id', 'createdAt'] as const

type DefaultedSet = PickTuple<UserFriendData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<UserFriendData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = [] as const

export type UpdateSet = PickTuple<UserFriendData, typeof updateKeys>

export const getByParametersKeys = exclude(keys, ['id'] as const)

export type ParametersSet = PickTuple<
  UserFriendData,
  typeof getByParametersKeys
>
