/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import DataModel, { DataModelError, MAX_RECORDS_LIMIT } from '../model'
import { CreateSet, HighlightData, keys as modelKeys, UpdateSet } from './model'
import { Table } from '../../utils/dictionary'
import Knex from 'knex'
import { ENABLE_DB_REQUEST_LOGGING, globalCounter } from '../helpers'
import DataLoader from 'dataloader'

class HighlightModel extends DataModel<HighlightData, CreateSet, UpdateSet> {
  protected batchLoader: DataLoader<string, HighlightData[]>
  public tableName = Table.HIGHLIGHT
  protected modelKeys = modelKeys

  batchGet: DataLoader<string, HighlightData[]>['load']

  constructor(kx: Knex, cache = true) {
    super(kx, cache)

    // override dataloader to skip rows where 'deleted = true'
    this.loader = new DataLoader(
      async (keys) => {
        if (ENABLE_DB_REQUEST_LOGGING) {
          globalCounter.log(this.tableName, 'load', JSON.stringify(keys))
        }

        try {
          const rows: HighlightData[] = await kx(this.tableName)
            .select(this.modelKeys)
            .whereIn('id', keys)
            .andWhere('deleted', false)
            .limit(MAX_RECORDS_LIMIT)

          const keyMap: Record<string, HighlightData> = {}
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
          console.error('DataModel error ', e)
          throw e
        }
      },
      { cache }
    )

    // separate dataloader for fetching grouped highlights
    this.batchLoader = new DataLoader(async (articleIds) => {
      if (ENABLE_DB_REQUEST_LOGGING) {
        globalCounter.log(
          this.tableName,
          'batchLoad',
          JSON.stringify(articleIds)
        )
      }

      const result = await this.kx(Table.HIGHLIGHT)
        .select(modelKeys)
        .whereIn('articleId', articleIds)
        .andWhere('deleted', false)
        .orderBy(`${Table.HIGHLIGHT}.created_at`, 'desc')
        .limit(MAX_RECORDS_LIMIT)
        .then((highlights: HighlightData[]) => {
          // group highlights so that each article has its own array of highlights
          const result: HighlightData[][] = Array.from(
            Array(articleIds.length),
            () => []
          )
          // keep track of nested array indices to preserve the order
          const positions = articleIds.reduce(
            (res, cur, i) => ({ ...res, [cur]: i }),
            {} as { [key: string]: number }
          )

          highlights.forEach((highlight) => {
            const index = positions[highlight.articleId]
            result[index].push({
              ...highlight,
              updatedAt: highlight.updatedAt || highlight.createdAt,
            })
            this.loader.prime(highlight.id, highlight)
          })

          return result
        })

      if (!result.length) {
        return new Array(articleIds.length).fill([])
      }
      return result
    })

    this.get = this.loader.load.bind(this.loader)
    this.getMany = this.loader.loadMany.bind(this.loader)
    this.batchGet = this.batchLoader.load.bind(this.batchLoader)
  }

  async unshareAllHighlights(
    articleId: string,
    userId: string,
    tx: Knex.Transaction
  ): Promise<HighlightData[]> {
    const rows: HighlightData[] = await tx(this.tableName)
      .update({ sharedAt: null })
      .where({ articleId, userId })
      .andWhere(tx.raw(`shared_at is not null`))
      .returning(this.modelKeys)

    for (const row of rows) {
      this.loader.prime(row.id, row)
    }

    return rows
  }

  async delete(
    id: string,
    tx: Knex.Transaction
  ): Promise<HighlightData | { error: DataModelError }> {
    const [row]: HighlightData[] = await tx(this.tableName)
      .update({ deleted: true })
      .where({ id })
      .returning(this.modelKeys)

    if (!row) return { error: DataModelError.notFound }

    this.loader.clear(id)
    return row
  }

  async deleteMany(
    idList: string[],
    tx: Knex.Transaction
  ): Promise<HighlightData[] | { error: DataModelError }> {
    const rows: HighlightData[] = await tx(this.tableName)
      .update({ deleted: true })
      .whereIn('id', idList)
      .returning(this.modelKeys)

    if (!rows.length) return { error: DataModelError.notFound }

    idList.forEach((id) => this.loader.clear(id))
    return rows
  }

  async getForUserArticle(
    userId: string,
    articleId: string
  ): Promise<HighlightData[]> {
    const highlights = await this.kx(Table.HIGHLIGHT)
      .select(modelKeys)
      .where('user_id', userId)
      .andWhere('article_id', articleId)
      .andWhere('deleted', false)
      .orderBy(`${Table.HIGHLIGHT}.created_at`, 'desc')
      .limit(MAX_RECORDS_LIMIT)

    const result = highlights.map((highlight) => {
      if (!highlight.updatedAt) {
        highlight.updatedAt = highlight.createdAt
      }
      this.loader.prime(highlight.id, highlight)
      return highlight
    })

    return result
  }
}

export default HighlightModel
