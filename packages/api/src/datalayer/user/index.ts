/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CreateSet,
  keys as modelKeys,
  ProfileCreateSet,
  profileKeys,
  ProfileUpdateSet,
  UpdateSet,
  UserData,
} from './model'
import DataModel, { DataModelError, MAX_RECORDS_LIMIT } from '../model'
import Knex from 'knex'
import { ENABLE_DB_REQUEST_LOGGING, globalCounter, logMethod } from '../helpers'
import { Table } from '../../utils/dictionary'
import DataLoader from 'dataloader'
import { Partialize } from '../../util'
import { Profile } from '../../generated/graphql'
import { kx as knexConfig } from './../knex_config'

const TOP_USERS = [
  'jacksonh',
  'nat',
  'luis',
  'satindar',
  'malandrina',
  'patrick',
  'alexgutjahr',
]

class UserModel extends DataModel<UserData, CreateSet, UpdateSet> {
  public tableName = Table.USER
  protected modelKeys = modelKeys
  constructor(kx: Knex = knexConfig, cache = true) {
    super(kx, cache)
    // override DataModel's base class dataloader to include profile join in user query
    this.loader = new DataLoader(
      async (keys) => {
        if (ENABLE_DB_REQUEST_LOGGING) {
          globalCounter.log(this.tableName, 'load', JSON.stringify(keys))
        }
        try {
          const rows: UserData[] = await this.kx({ u: this.tableName })
            .select([
              ...this.modelKeys.map((k) => `u.${k}`),
              this.kx.raw('to_jsonb(p) as profile'),
            ])
            .leftJoin({ p: Table.USER_PROFILE }, 'u.id', 'p.user_id')
            .whereIn('u.id', keys)
            .limit(MAX_RECORDS_LIMIT)

          const keyMap: Record<string, UserData> = {}
          for (const row of rows) {
            if (row.id in keyMap) continue
            keyMap[row.id] = row
          }
          const result = keys.map((key) => keyMap[key])
          if (result.length !== keys.length) {
            console.error('DataModel error: count mismatch ', keys, result)
          }
          return result
        } catch (e) {
          console.error('DataModel error: ', e)
          throw e
        }
      },
      { cache }
    )

    this.get = this.loader.load.bind(this.loader)
    this.getMany = this.loader.loadMany.bind(this.loader)
  }

  @logMethod
  async getWhere(
    params: {
      email?: UserData['email']
      source?: UserData['source']
      username?: UserData['profile']['username']
      sourceUserId?: UserData['sourceUserId']
      'p.username'?: UserData['profile']['username']
    },
    tx = this.kx
  ): Promise<UserData | null> {
    // rewrite username key if it exists to use it with joined profile table
    if ('username' in params) {
      params['p.username'] = params.username
      delete params.username
    }

    const row: UserData | null = await tx({ u: this.tableName })
      .select([
        ...this.modelKeys.map((k) => `u.${k}`),
        this.kx.raw('to_jsonb(p) as profile'),
      ])
      .leftJoin({ p: Table.USER_PROFILE }, 'u.id', 'p.user_id')
      .where(params)
      .first()
    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async exists(
    params: {
      email?: UserData['email']
      username?: UserData['profile']['username']
    },
    tx = this.kx
  ): Promise<boolean> {
    const row: UserData | null = await tx({ u: this.tableName })
      .select('u.id')
      .leftJoin({ p: Table.USER_PROFILE }, 'u.id', 'p.user_id')
      .where('email', params.email || '')
      .orWhere('p.username', params.username || '')
      .first()

    return !!row?.id
  }

  @logMethod
  async getSharedHighlightsStats(
    userId: string,
    tx = this.kx
  ): Promise<{ sharedHighlightsCount: number; sharedNotesCount: number }> {
    const row = await tx('omnivore.highlight as h2')
      .select([
        tx.raw('count(h2.id) as shared_highlights_count'),
        tx.raw('count(h2.annotation) as shared_notes_count'),
      ])
      .whereRaw('h2.user_id::text = ?', [userId])
      .andWhere('h2.deleted', '=', tx.raw('FALSE'))
      .whereNotNull('h2.shared_at')
      .first()

    if (!row) {
      return { sharedHighlightsCount: 0, sharedNotesCount: 0 }
    }
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async getUserDetails(
    viewerId: string | undefined,
    userId: string,
    tx = this.kx
  ): Promise<
    | (UserData & {
        followersCount: number
        friendsCount: number
        viewerIsFollowing: boolean
      })
    | null
  > {
    /*
     * We join the user table with the user_friends table twice, once to fetch
     * the list of friends, and another join to query list of followers. We
     * group the results by user ID, aggregate the friends and followers
     * results using postgres array operators. We use coalesce() to return 0
     * when the results array is null.
     */
    const row = await tx({ u: this.tableName })
      .select([
        'u.*',
        this.kx.raw(
          'coalesce(array_length(array_remove(array_agg(DISTINCT omnivore.user_friends.friend_user_id), null), 1), 0) as friends_count'
        ),
        this.kx.raw(
          'coalesce(array_length(array_remove(array_agg(DISTINCT user_followers.user_id), null), 1), 0) as followers_count'
        ),
        this.kx.raw(
          viewerId
            ? 'coalesce(? = ANY(array_agg(DISTINCT user_followers.user_id)), false) as viewer_is_following'
            : '? as _unused',
          [viewerId || '']
        ),
        this.kx.raw('to_jsonb(p) as profile'),
      ])
      .leftJoin('omnivore.user_friends', function () {
        this.on(
          tx.raw('omnivore.user_friends.user_id::text = ?', [userId])
        ).andOn('omnivore.user_friends.user_id', '=', 'u.id')
      })
      .leftJoin('omnivore.user_friends as user_followers', function () {
        this.on(tx.raw('user_followers.friend_user_id::text = ?', [userId]))
      })
      .leftJoin({ p: Table.USER_PROFILE }, 'u.id', 'p.user_id')
      .whereRaw('u.id::text = ?', [userId])
      .groupBy('u.id')
      .groupBy('p.id')
      .first()
    if (!row) {
      return null
    }
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async getTopUsers(
    userId: string,
    tx = this.kx
  ): Promise<
    | (UserData & {
        followersCount: number
        friendsCount: number
        isFriend: boolean
      })[]
    | null
  > {
    const rows = await tx({ u: this.tableName })
      .select(['u.*', this.kx.raw('to_jsonb(p) as profile')])
      .leftJoin({ p: Table.USER_PROFILE }, 'u.id', 'p.user_id')
      .whereIn('p.username', TOP_USERS)
      .limit(MAX_RECORDS_LIMIT)

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }

  @logMethod
  async getUserFollowersList(
    userId: string,
    tx = this.kx
  ): Promise<UserData[]> {
    const rows: UserData[] = await tx({ u: this.tableName })
      .select([`u.*`, this.kx.raw('to_jsonb(p) as profile')])
      .leftJoin(Table.USER_FRIEND, `user_id`, '=', `u.id`)
      .leftJoin({ p: Table.USER_PROFILE }, 'u.id', 'p.user_id')
      .where(`friend_user_id`, '=', userId)
      .limit(MAX_RECORDS_LIMIT)

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }

  @logMethod
  async getUserFollowingList(
    userId: string,
    tx = this.kx
  ): Promise<UserData[]> {
    const rows: UserData[] = await tx({ u: this.tableName })
      .select([`u.*`, this.kx.raw('to_jsonb(p) as profile')])
      .leftJoin(Table.USER_FRIEND, `friend_user_id`, '=', `u.id`)
      .leftJoin({ p: Table.USER_PROFILE }, 'u.id', 'p.user_id')
      .where(`user_friends.user_id`, '=', userId)
      .limit(MAX_RECORDS_LIMIT)

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }

  @logMethod
  async createUserWithProfile(
    createSet: CreateSet,
    username: string,
    bio?: string
  ): Promise<UserData> {
    return this.kx.transaction(async (tx) => {
      const userData = await this.create(createSet, tx)
      await this.createProfile({ username, userId: userData.id, bio }, tx)
      return userData
    })
  }

  @logMethod
  async create(set: CreateSet, tx?: Knex.Transaction): Promise<UserData> {
    if (tx) {
      return super.create(set, tx)
    }
    return this.kx.transaction((tx) => super.create(set, tx))
  }

  @logMethod
  async update(
    userId: string,
    set: UpdateSet,
    tx?: Knex.Transaction
  ): Promise<UserData> {
    if (tx) {
      return super.update(userId, set, tx)
    }
    return this.kx.transaction((tx) => super.update(userId, set, tx))
  }

  @logMethod
  async createProfile(
    set: ProfileCreateSet,
    tx?: Knex.Transaction
  ): Promise<Profile> {
    if (tx) {
      const [profile] = (await tx(Table.USER_PROFILE)
        .insert(set)
        .returning(profileKeys)) as Profile[]
      return profile
    }

    return this.kx.transaction(async (tx) => {
      const [profile] = (await tx(Table.USER_PROFILE)
        .insert(set)
        .returning(profileKeys)) as Profile[]
      return profile
    })
  }

  @logMethod
  async updateProfile(
    userId: string,
    set: Partialize<ProfileUpdateSet>,
    tx?: Knex.Transaction
  ): Promise<Profile> {
    if (tx) {
      const [profile]: Profile[] = await tx(Table.USER_PROFILE)
        .update(set)
        .where({ userId })
        .returning(profileKeys)
      return profile
    }
    return this.kx.transaction((tx) => this.updateProfile(userId, set, tx))
  }

  @logMethod
  async delete(
    userId: string,
    tx?: Knex.Transaction
  ): Promise<UserData | { error: DataModelError }> {
    if (tx) {
      return super.delete(userId, tx)
    }

    return this.kx.transaction((tx) => super.delete(userId, tx))
  }
}

export default UserModel
