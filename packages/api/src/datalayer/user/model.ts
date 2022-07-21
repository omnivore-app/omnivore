import { exclude, Partialize, PickTuple } from '../../util'

//                                 Table "omnivore.user"
//      Column     |           Type           | Collation | Nullable |                Default
// ----------------+--------------------------+-----------+----------+---------------------------------------
//  id             | uuid                     |           | not null | uuid_generate_v1mc()
//  first_name     | text                     |           |          |
//  last_name      | text                     |           |          |
//  source         | registration_type        |           | not null |
//  email          | text                     |           |          |
//  phone          | text                     |           |          |
//  source_user_id | text                     |           | not null |
//  created_at     | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
//  updated_at     | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
//  membership     | omnivore.membership_tier |           | not null | 'WAIT_LIST'::omnivore.membership_tier

//                         Table "omnivore.user_profile"
//   Column    |           Type           | Collation | Nullable |       Default
// -------------+--------------------------+-----------+----------+----------------------
// id          | uuid                     |           | not null | uuid_generate_v1mc()
// username    | text                     |           | not null |
// private     | boolean                  |           | not null | false
// bio         | text                     |           |          |
// picture_url | text                     |           |          |
// user_id     | uuid                     |           | not null |
// created_at  | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
// updated_at  | timestamp with time zone |           |          |

export interface UserData {
  id: string
  name: string
  source: string
  membership: string
  email?: string | null
  phone?: string | null
  sourceUserId: string
  createdAt: Date
  // snake_case here because our knex case transformation doesn't support nested objects
  profile: {
    id: string
    username: string
    bio?: string | null
    picture_url?: string | null
    private: boolean
  }
  password?: string | null
  status?: StatusType
}

export enum MembershipTier {
  WaitList = 'WAIT_LIST',
  Beta = 'BETA',
}

export enum RegistrationType {
  Google = 'GOOGLE',
  Apple = 'APPLE',
  Email = 'EMAIL',
}

export enum StatusType {
  Active = 'ACTIVE',
  Pending = 'PENDING',
}

export const keys = [
  'id',
  'name',
  'source',
  'membership',
  'email',
  'phone',
  'sourceUserId',
  'createdAt',
  'password',
  'status',
] as const

export const defaultedKeys = ['id', 'createdAt'] as const

type DefaultedSet = PickTuple<UserData, typeof defaultedKeys>

export const createKeys = exclude(keys, defaultedKeys)

export type CreateSet = PickTuple<UserData, typeof createKeys> &
  Partialize<DefaultedSet>

export const updateKeys = [
  'name',
  'sourceUserId',
  'source',
  'password',
] as const

export type UpdateSet = PickTuple<UserData, typeof updateKeys>

// Profile-related types
export const profileKeys = [
  'id',
  'username',
  'bio',
  'pictureUrl',
  'private',
  'userId',
] as const

export const createProfileKeys = exclude(profileKeys, ['id'])

export type ProfileCreateSet = PickTuple<
  UserData['profile'],
  typeof createProfileKeys
>

export const profileUpdateKeys = [
  'username',
  'bio',
  'picture_url',
  'private',
] as const

export type ProfileUpdateSet = PickTuple<
  UserData['profile'],
  typeof profileUpdateKeys
>
