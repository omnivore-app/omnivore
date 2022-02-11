/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ArticleData, CreateSet, keys as modelKeys, UpdateSet } from './model'
import DataModel from '../model'
import Knex from 'knex'
import { Table } from '../../utils/dictionary'
import { logMethod } from '../helpers'

class ArticleModel extends DataModel<ArticleData, CreateSet, UpdateSet> {
  public tableName = Table.PAGES
  protected modelKeys = modelKeys
  constructor(kx: Knex, cache = true) {
    super(kx, cache)
  }

  @logMethod
  async getByUrlAndHash(
    params: { url: ArticleData['url']; hash: ArticleData['hash'] },
    tx = this.kx
  ): Promise<ArticleData | null> {
    const row: ArticleData | null = await tx(this.tableName)
      .select(this.modelKeys)
      .where(params)
      .first()
    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async getByUploadFileId(
    uploadFileId: string,
    tx = this.kx
  ): Promise<ArticleData | null> {
    const row: ArticleData | null = await tx(this.tableName)
      .select(this.modelKeys)
      .where({ uploadFileId })
      .first()
    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async updateContent(
    id: string,
    content: string,
    title?: string,
    author?: string,
    description?: string,
    tx = this.kx
  ): Promise<boolean> {
    const items = { content, title, author, description }
    if (!title) delete items.title
    if (!author) delete items.author
    if (!description) delete items.description

    const stmt = tx(this.tableName).update(items).where({ id }).returning('*')
    const [row] = await stmt
    return !!row
  }
}

export default ArticleModel
