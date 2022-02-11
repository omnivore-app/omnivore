import {
  CreateSet,
  keys as modelKeys,
  UpdateSet,
  ArticleSavingRequestData,
} from './model'
import DataModel from '../model'
import Knex from 'knex'
import { Table } from '../../utils/dictionary'
import { logMethod } from '../helpers'

class ArticleSavingRequestModel extends DataModel<
  ArticleSavingRequestData,
  CreateSet,
  UpdateSet
> {
  public tableName = Table.ARTICLE_SAVING_REQUEST
  protected modelKeys = modelKeys
  constructor(kx: Knex, cache = true) {
    super(kx, cache)
  }

  @logMethod
  async getByUserId(
    userId: ArticleSavingRequestData['userId'],
    tx = this.kx
  ): Promise<ArticleSavingRequestData | null> {
    const row: ArticleSavingRequestData | null = await tx(this.tableName)
      .select()
      .where({ userId })
      .first(this.modelKeys)
    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async getByUserIdAndArticleId(
    userId: ArticleSavingRequestData['userId'],
    articleId: ArticleSavingRequestData['articleId'],
    tx = this.kx
  ): Promise<ArticleSavingRequestData | null> {
    const row: ArticleSavingRequestData | null = await tx(this.tableName)
      .select()
      .where({ userId, articleId })
      .first(this.modelKeys)
    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }
}

export default ArticleSavingRequestModel
