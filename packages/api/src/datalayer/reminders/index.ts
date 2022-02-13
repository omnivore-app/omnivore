import {
  CreateSet,
  keys as modelKeys,
  ParametersSet,
  ReminderData,
  UpdateSet,
} from './model'
import DataModel, { DataModelError } from '../model'
import Knex from 'knex'
import { Table } from '../../utils/dictionary'
import { logMethod } from '../helpers'
import { ArticleData } from '../article/model'
import { UserArticleData } from '../links/model'

const JOIN_COLS = [
  'links2.id',
  'links2.slug',
  'pages.title',
  'pages.description',
  'pages.author',
  'pages.image',
  'reminders.send_notification',
]

class ReminderModel extends DataModel<ReminderData, CreateSet, UpdateSet> {
  public tableName = Table.REMINDER
  protected modelKeys = modelKeys

  constructor(kx: Knex, cache = true) {
    super(kx, cache)
  }

  @logMethod
  async setRemindersComplete(
    userId: ReminderData['userId'],
    remindAt: ReminderData['remindAt'],
    tx = this.kx
  ): Promise<ReminderData | null> {
    const [row]: ReminderData[] = await tx(this.tableName)
      .where({ userId, remindAt })
      .update({ status: 'COMPLETED' })
      .returning(this.modelKeys)

    if (!row) return null

    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async getCreated(
    id: ReminderData['id'],
    tx = this.kx
  ): Promise<ReminderData | null> {
    const row: ReminderData = await tx(this.tableName)
      .select()
      .where({ id, status: 'CREATED' })
      .first(this.modelKeys)

    if (!row) return null

    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async getCreatedByParameters<K extends keyof ParametersSet>(
    userId: ReminderData['userId'],
    params: Record<K, ReminderData[K]>,
    tx = this.kx
  ): Promise<ReminderData | null> {
    const row: ReminderData = await tx(this.tableName)
      .select()
      .where({ userId: userId, status: 'CREATED' })
      .andWhere(params)
      .first(this.modelKeys)

    if (!row) return null

    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async getByRequestId(
    userId: string,
    requestId: string,
    tx = this.kx
  ): Promise<ReminderData | null> {
    const row: ReminderData = await tx(this.tableName)
      .select()
      .where({ userId, articleSavingRequestId: requestId })
      .first(this.modelKeys)

    if (!row) return null

    this.loader.prime(row.id, row)
    return row
  }

  @logMethod
  async existByUserAndRemindAt(
    userId: ReminderData['userId'],
    remindAt: ReminderData['remindAt'],
    tx = this.kx
  ): Promise<boolean> {
    const row: ReminderData | null = await tx(this.tableName)
      .select()
      .where({ userId: userId, status: 'CREATED', remindAt: remindAt })
      .first('id')

    return !!row?.id
  }

  @logMethod
  async getByUserAndRemindAt(
    userId: ReminderData['userId'],
    remindAt: ReminderData['remindAt'],
    tx = this.kx
  ): Promise<(ReminderData & ArticleData & UserArticleData)[] | null> {
    const rows: (ReminderData & ArticleData & UserArticleData)[] | null =
      await tx(this.tableName)
        .select(JOIN_COLS)
        .leftJoin(Table.LINKS, 'links.id', 'reminders.link_id')
        .leftJoin(
          Table.ARTICLE_SAVING_REQUEST,
          'article_saving_request.id',
          'reminders.article_saving_request_id'
        )
        .leftJoin(Table.PAGES, function () {
          this.on('pages.id ', '=', 'links.article_id')
          this.orOn('pages.id', '=', 'article_saving_request.article_id')
        })
        .leftJoin(`${Table.LINKS} as links2`, 'links2.article_id', 'pages.id')
        .where({
          'reminders.user_id': userId,
          'reminders.status': 'CREATED',
          'reminders.remind_at': remindAt,
        })

    if (rows.length == 0) return null

    return rows
  }

  @logMethod
  async delete(
    id: ReminderData['id'],
    tx = this.kx
  ): Promise<ReminderData | { error: DataModelError }> {
    const [row]: ReminderData[] = await tx(this.tableName)
      .where({ id })
      .update({ status: 'DELETED' })
      .returning(this.modelKeys)

    if (!row) return { error: DataModelError.notFound }

    this.loader.clear(id)
    return row
  }
}

export default ReminderModel
