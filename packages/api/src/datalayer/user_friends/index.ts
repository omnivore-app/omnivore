/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CreateSet,
  keys as modelKeys,
  UpdateSet,
  UserFriendData,
} from './model'
import DataModel, { MAX_RECORDS_LIMIT } from '../model'
import Knex from 'knex'
import { Table } from '../../utils/dictionary'
import { ENABLE_DB_REQUEST_LOGGING, globalCounter, logMethod } from '../helpers'
import DataLoader from 'dataloader'

class UserFriendModel extends DataModel<UserFriendData, CreateSet, UpdateSet> {
  public tableName = Table.USER_FRIEND
  protected modelKeys = modelKeys

  protected getFriendsLoader: DataLoader<string, string[]>
  getFriends: DataLoader<string, string[]>['load']

  constructor(kx: Knex, cache = true) {
    super(kx, cache)
    this.getFriendsLoader = new DataLoader(
      async (keys) => {
        if (ENABLE_DB_REQUEST_LOGGING) {
          globalCounter.log(
            this.tableName,
            'user_friends_loader',
            JSON.stringify(keys)
          )
        }
        const rows: UserFriendData[] = await this.kx(this.tableName)
          .select(this.modelKeys)
          .whereIn('userId', keys)
          .limit(MAX_RECORDS_LIMIT)

        const keyMap: Record<string, string[]> = {}
        for (const row of rows) {
          keyMap[row.userId] = [...(keyMap[row.userId] || []), row.friendUserId]
        }

        const result = keys.map((userId) => keyMap[userId] || [])
        // logger.debug('\n\n\n\n\nResult for userId_articleId_load', { keys, result });

        if (result.length !== keys.length) {
          console.error('DataModel error: count mismatch ', keys, result)
        }
        return result
      },
      { cache }
    )

    this.getFriends = this.getFriendsLoader.load.bind(this.getFriendsLoader)
  }

  @logMethod
  async getByUserFriendId(
    userId: UserFriendData['userId'],
    friendUserId: UserFriendData['friendUserId'],
    tx = this.kx
  ): Promise<UserFriendData | null> {
    const row: UserFriendData | null = await tx(this.tableName)
      .select()
      .where({ userId, friendUserId })
      .first(this.modelKeys)
    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async getFollowers(
    userId: UserFriendData['userId'],
    tx = this.kx
  ): Promise<UserFriendData[]> {
    const rows: UserFriendData[] = await tx(this.tableName)
      .where({ friendUserId: userId })
      .select(this.modelKeys)
      .limit(MAX_RECORDS_LIMIT)
    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }

  @logMethod
  async getByFriendIds(
    userId: string,
    followersIds: string[],
    tx = this.kx
  ): Promise<UserFriendData[]> {
    const rows: UserFriendData[] = await tx(this.tableName)
      .select(this.modelKeys)
      .whereIn('friend_user_id', followersIds)
      .andWhere({ userId })
      .limit(MAX_RECORDS_LIMIT)

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }
}

export default UserFriendModel
