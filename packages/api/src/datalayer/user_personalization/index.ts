/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CreateSet,
  keys as modelKeys,
  UpdateSet,
  UserPersonalizationData,
} from './model'
import DataModel from '../model'
import Knex from 'knex'
import { Table } from '../../utils/dictionary'
import { camelCase } from 'voca'
import { logMethod } from '../helpers'

class UserPersonalizationModel extends DataModel<
  UserPersonalizationData,
  CreateSet,
  UpdateSet
> {
  public tableName = Table.USER_PERSONALIZATION
  protected modelKeys = modelKeys
  constructor(kx: Knex, cache = true) {
    super(kx, cache)
  }

  @logMethod
  async getByUserId(
    userId: UserPersonalizationData['userId'],
    tx = this.kx
  ): Promise<UserPersonalizationData | null> {
    const row: UserPersonalizationData | null = await tx(this.tableName)
      .select()
      .where({ userId })
      .first(this.modelKeys)
    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async upsert(
    data: CreateSet,
    tx = this.kx
  ): Promise<UserPersonalizationData> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, id, ...updateSet } = data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = {} as any
    const result = (
      await tx.raw(
        `? ON CONFLICT (user_id)
              DO ?`,
        [
          tx(this.tableName).insert(data),
          tx.update(updateSet).returning(this.modelKeys),
        ]
      )
    ).rows[0]
    for (const [key, value] of Object.entries(result)) {
      row[camelCase(key)] = value
    }
    this.loader.prime(row.id, row)
    return row
  }
}

export default UserPersonalizationModel
