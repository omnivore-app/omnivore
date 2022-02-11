/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CreateSet,
  keys as modelKeys,
  UpdateSet,
  UploadFileData,
} from './model'
import DataModel from '../model'
import Knex from 'knex'
import { Table } from '../../utils/dictionary'
import { logMethod } from '../helpers'

class UploadFileDataModel extends DataModel<
  UploadFileData,
  CreateSet,
  UpdateSet
> {
  public tableName = Table.UPLOAD_FILES
  protected modelKeys = modelKeys
  constructor(kx: Knex, cache = true) {
    super(kx, cache)
  }

  @logMethod
  async create(set: CreateSet, tx?: Knex.Transaction): Promise<UploadFileData> {
    if (tx) {
      return super.create(set, tx)
    }
    return this.kx.transaction((tx) => super.create(set, tx))
  }

  @logMethod
  async getWhere(
    params: {
      id?: UploadFileData['id']
      userId?: UploadFileData['userId']
      url?: UploadFileData['url']
    },
    tx = this.kx
  ): Promise<UploadFileData | null> {
    const row: UploadFileData | null = await tx(this.tableName)
      .select(this.modelKeys)
      .where(params)
      .first()
    if (!row) return null
    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async setFileUploadComplete(
    id: UploadFileData['id'],
    tx = this.kx
  ): Promise<UploadFileData | null> {
    const row: UploadFileData | null = await tx(this.tableName)
      .select()
      .where({ id })
      .update({ status: 'COMPLETED' })
      .returning(this.modelKeys)
      .limit(2)
      .then((result) => {
        if (result.length == 1) {
          return result[0]
        }
        throw Error('Should never return multiple rows')
      })
    if (row?.id) {
      this.loader.prime(row.id, row)
    }
    return row
  }

  async uploadFileForUserAndArticle(
    userId: string,
    articleId: string
  ): Promise<UploadFileData | null> {
    const row: UploadFileData | null = await this.kx(Table.PAGES)
      .select(this.modelKeys.map((k) => `${Table.UPLOAD_FILES}.${k}`))
      .join(Table.UPLOAD_FILES, 'upload_files.id', '=', 'pages.upload_file_id')
      .where({ 'upload_files.userId': userId, 'pages.id': articleId })
      .limit(1)
      .first()
    return row
  }

  async uploadFileForArticle(
    articleId: string
  ): Promise<UploadFileData | null> {
    const row: UploadFileData | null = await this.kx(Table.PAGES)
      .select(this.modelKeys.map((k) => `${Table.UPLOAD_FILES}.${k}`))
      .join(Table.UPLOAD_FILES, 'upload_files.id', '=', 'pages.upload_file_id')
      .where({ 'pages.id': articleId })
      .limit(1)
      .first()
    return row
  }
}

export default UploadFileDataModel
