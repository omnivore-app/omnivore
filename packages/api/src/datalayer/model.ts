/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import DataLoader from 'dataloader'
import Knex from 'knex'
import { ENABLE_DB_REQUEST_LOGGING, globalCounter } from './helpers'

export enum DataModelError {
  notFound = 'NOT_FOUND',
}

export const MAX_RECORDS_LIMIT = 1000

abstract class DataModel<
  ModelData extends { id: string },
  CreateSet,
  UpdateSet
> {
  protected loader: DataLoader<string, ModelData>
  public tableName!: string
  protected modelKeys!: readonly (keyof ModelData)[]
  kx: Knex
  get: DataLoader<string, ModelData>['load']
  getMany: DataLoader<string, ModelData>['loadMany']

  /**
   * @param kx - DB connection
   * @param userId - user id to use when executing data loader queries
   * */
  constructor(kx: Knex, cache = true) {
    this.kx = kx
    this.loader = new DataLoader(
      async (keys) => {
        if (ENABLE_DB_REQUEST_LOGGING) {
          globalCounter.log(this.tableName, 'load', JSON.stringify(keys))
        }
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: ModelData[] = await this.kx(this.tableName)
            .select(this.modelKeys)
            .whereIn('id', keys)

          const keyMap: Record<string, ModelData> = {}
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

  /**
   * Gets entity that accomplish "whereIn" condition
   * @param field - string specifying a field to use in "whereIn" condition
   * @param values - an array of values to compare in "whereIn" condition
   * @param tx - DB transaction
   * @example
   * // Return entity that match id comparison
   * const collaboratorsIds = ['1', '2'];
   * return models.user.getWhereIn('id', collaboratorsIds);
   */
  async getWhereIn<K extends keyof ModelData>(
    field: K,
    values: ModelData[K][],
    tx = this.kx,
    notNullField: string | null = null
  ): Promise<ModelData[]> {
    let queryPromise = tx(this.tableName)
      .select(this.modelKeys)
      .whereIn(field, values)
      .orderBy('created_at', 'desc')
    if (notNullField) {
      queryPromise = queryPromise.whereNotNull(notNullField)
    }
    const rows: ModelData[] = await queryPromise
    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }

  async getAll(tx = this.kx): Promise<ModelData[]> {
    const rows: ModelData[] = await tx(this.tableName)
      .select(this.modelKeys)
      .orderBy('created_at', 'desc')
    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }

  async create(data: CreateSet, tx = this.kx): Promise<ModelData> {
    const [row]: ModelData[] = await tx(this.tableName)
      .insert(data)
      .returning('*')
    this.loader.prime(row.id, row)
    return row
  }

  async createMany(
    data: CreateSet[],
    tx: Knex.Transaction
  ): Promise<ModelData[]> {
    const rows: ModelData[] = await tx
      .batchInsert(this.tableName, data)
      .returning('*')
    for (const row of rows) {
      this.loader.prime(row.id, row)
    }
    return rows
  }

  async update(id: string, data: UpdateSet, tx = this.kx): Promise<ModelData> {
    const [row]: ModelData[] = await tx(this.tableName)
      .update(data)
      .where({ id })
      .returning('*')
    this.loader.prime(id, row)
    return row
  }

  async delete(
    id: string,
    tx: Knex.Transaction
  ): Promise<ModelData | { error: DataModelError }> {
    const [row]: ModelData[] = await tx(this.tableName)
      .where({ id })
      .delete()
      .returning('*')

    if (!row) return { error: DataModelError.notFound }

    this.loader.clear(id)
    return row
  }

  async deleteWhere<K extends keyof ModelData>(
    params: Record<K, ModelData[K]>,
    tx: Knex.Transaction
  ): Promise<ModelData[]> {
    const rows: ModelData[] = await tx(this.tableName)
      .andWhere(params)
      .delete()
      .returning('*')

    for (const row of rows) {
      this.loader.clear(row.id)
    }
    return rows
  }

  async deleteWhereIn<K extends keyof ModelData>(
    params: Record<K, ModelData[K][]>,
    tx: Knex.Transaction
  ): Promise<ModelData[]> {
    const rows: ModelData[] = await tx(this.tableName)
      .where((builder) => {
        for (const field in params) {
          builder.whereIn(field, params[field])
        }
      })
      .delete()
      .returning('*')

    for (const row of rows) {
      this.loader.clear(row.id)
    }
    return rows
  }
}

export default DataModel
