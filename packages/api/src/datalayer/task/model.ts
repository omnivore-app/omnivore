import { exclude, Partialize, PickTuple } from '../../util'

/**
 * ```
 *         Column        |           Type           | Collation  |   Nullable  |       Default
 *  ---------------------+--------------------------+------------+-------------+----------------------
 *   id                  | uuid                     |            | not null    | uuid_generate_v1mc()
 *   title               | text                     |            | not null    |
 *   created_by          | uuid                     |            | not null    |
 *   created_at          | timestamp with time zone |            | not null    |
 * ```
 * */
export interface TaskData {
  id: string
  title: string
  createdBy: string
  createdAt: Date
}

export const keys = ['id', 'title', 'createdBy', 'createdAt'] as const

export const defaultedKeys = ['id'] as const

type DefaultedSet = PickTuple<TaskData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<TaskData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = ['title'] as const

export type UpdateSet = PickTuple<TaskData, typeof updateKeys>
