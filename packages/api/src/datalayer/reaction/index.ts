import {
  globalCounter,
  ENABLE_DB_REQUEST_LOGGING,
  logMethod,
} from './../helpers'
import { CreateSet, keys as modelKeys, UpdateSet, ReactionData } from './model'
import DataModel, { DataModelError, MAX_RECORDS_LIMIT } from '../model'
import Knex from 'knex'
import { Table } from '../../utils/dictionary'

import DataLoader from 'dataloader'

class ReactionModel extends DataModel<ReactionData, CreateSet, UpdateSet> {
  public tableName = Table.REACTION
  protected modelKeys = modelKeys

  protected getBatchLoader: (
    type: 'highlightId' | 'userArticleId'
  ) => DataLoader<string, ReactionData[]>

  batchGetFromArticle: DataLoader<string, ReactionData[]>['load']
  batchGetFromHighlight: DataLoader<string, ReactionData[]>['load']

  constructor(kx: Knex, cache = true) {
    super(kx, cache)

    // override dataloader to skip rows where 'deleted = true'

    // separate dataloader for fetching grouped highlights
    this.getBatchLoader = (type: 'highlightId' | 'userArticleId') =>
      new DataLoader(async (ids) => {
        if (ENABLE_DB_REQUEST_LOGGING) {
          globalCounter.log(this.tableName, 'batchLoad', JSON.stringify(ids))
        }

        const result: ReactionData[][] = await this.kx(Table.REACTION)
          .select(modelKeys)
          .whereIn(type, ids)
          .andWhere('deleted', false)
          .orderBy(`${Table.REACTION}.created_at`, 'desc')
          .limit(MAX_RECORDS_LIMIT)
          .then((reactions: ReactionData[]) => {
            // group highlights so that each article has its own array of highlights
            const arr: ReactionData[][] = Array.from(
              Array(ids.length),
              () => []
            )
            // keep track of nested array indices to preserve the order
            const positions = ids.reduce(
              (acc, cur, i) => ({ ...acc, [cur]: i }),
              {} as { [key: string]: number }
            )

            reactions.forEach((re) => {
              const pos = re[type]
              if (!pos) {
                return
              }
              const index = positions[pos]
              arr[index].push({
                ...re,
                updatedAt: re.updatedAt || re.createdAt,
              })
              this.loader.prime(re.id, re)
            })

            return arr
          })

        return result
      })

    this.get = this.loader.load.bind(this.loader)
    this.getMany = this.loader.loadMany.bind(this.loader)

    const ba = this.getBatchLoader('userArticleId')
    const bh = this.getBatchLoader('highlightId')

    this.batchGetFromArticle = ba.load.bind(ba)
    this.batchGetFromHighlight = bh.load.bind(bh)
  }

  @logMethod
  async getByUserAndParam<K extends keyof CreateSet>(
    userId: ReactionData['userId'],
    params: Record<K, ReactionData[K]>,
    tx = this.kx
  ): Promise<ReactionData | null> {
    const row: ReactionData | null = await tx(this.tableName)
      .select()
      .where({ userId })
      .andWhere(params)
      .andWhere('deleted', false)
      .first(this.modelKeys)

    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  async delete(
    id: string,
    tx: Knex.Transaction
  ): Promise<ReactionData | { error: DataModelError }> {
    const [row]: ReactionData[] = await tx(this.tableName)
      .update({ deleted: true })
      .where({ id })
      .returning(this.modelKeys)

    if (!row) return { error: DataModelError.notFound }

    this.loader.clear(id)
    return row
  }
}

export default ReactionModel
