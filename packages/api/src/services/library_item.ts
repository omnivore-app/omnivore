import { ExpressionToken, LiqeQuery } from '@omnivore/liqe'
import { camelCase } from 'lodash'
import { DateTime } from 'luxon'
import {
  DeepPartial,
  EntityManager,
  FindOptionsWhere,
  In,
  ObjectLiteral,
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { ReadingProgressDataSource } from '../datasources/reading_progress_data_source'
import { appDataSource } from '../data_source'
import { EntityLabel } from '../entity/entity_label'
import { Highlight } from '../entity/highlight'
import { Label } from '../entity/label'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { env } from '../env'
import { BulkActionType, InputMaybe, SortParams } from '../generated/graphql'
import { createPubSubClient, EntityEvent, EntityType } from '../pubsub'
import { redisDataSource } from '../redis_data_source'
import {
  authTrx,
  getColumns,
  paramtersToObject,
  queryBuilderToRawSql,
  Select,
  Sort,
  SortOrder,
} from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { Merge, PickTuple } from '../util'
import { enqueueBulkUploadContentJob } from '../utils/createTask'
import { deepDelete, setRecentlySavedItemInRedis } from '../utils/helpers'
import { logError, logger } from '../utils/logger'
import { parseSearchQuery } from '../utils/search'
import { contentFilePath, downloadFromBucket } from '../utils/uploads'
import { HighlightEvent } from './highlights'
import { addLabelsToLibraryItem, LabelEvent } from './labels'

const columnsToDelete = [
  'user',
  'uploadFile',
  'previewContentType',
  'links',
  'textContentHash',
  'readableContent',
  'originalContent',
  'feedContent',
] as const
type ColumnsToDeleteType = typeof columnsToDelete[number]
type ItemBaseEvent = Merge<
  Omit<DeepPartial<LibraryItem>, ColumnsToDeleteType>,
  {
    labels?: LabelEvent[]
    highlights?: HighlightEvent[]
  }
>
export type ItemEvent = Merge<ItemBaseEvent, EntityEvent>

export class RequiresSearchQueryError extends Error {
  constructor() {
    super('Requires a search query')
  }
}

enum ReadFilter {
  ALL = 'all',
  READ = 'read',
  READING = 'reading',
  UNREAD = 'unread',
  SEEN = 'seen',
}

enum InFilter {
  ALL = 'all',
  INBOX = 'inbox',
  ARCHIVE = 'archive',
  TRASH = 'trash',
  FOLLOWING = 'following',
}

export interface SearchArgs {
  from?: number
  size?: number
  includePending?: boolean | null
  includeDeleted?: boolean
  includeContent?: boolean
  useFolders?: boolean
  query?: string | null
}

export interface SearchResultItem {
  annotation?: string | null
  author?: string | null
  createdAt: Date
  description?: string | null
  id: string
  image?: string | null
  pageId?: string
  pageType: string
  publishedAt?: Date
  quote?: string | null
  shortId?: string | null
  slug: string
  title: string
  uploadFileId?: string | null
  url: string
  readingProgressTopPercent?: number
  readingProgressPercent: number
  readingProgressAnchorIndex: number
  userId: string
  state?: LibraryItemState
  language?: string
  readAt?: Date
  savedAt: Date
  updatedAt?: Date
  labels?: Label[]
  highlights?: Highlight[]
  wordsCount?: number
  siteName?: string
  siteIcon?: string
  content?: string
}

export enum SortBy {
  SAVED = 'saved',
  UPDATED = 'updated',
  PUBLISHED = 'published',
  READ = 'read',
  WORDS_COUNT = 'wordscount',
}

const readingProgressDataSource = new ReadingProgressDataSource()

export const batchGetLibraryItems = async (ids: readonly string[]) => {
  // select all columns except content
  const select = getColumns(libraryItemRepository).filter(
    (select) => ['originalContent', 'readableContent'].indexOf(select) === -1
  )
  const items = await authTrx(async (tx) =>
    tx.getRepository(LibraryItem).find({
      select,
      where: {
        id: In(ids as string[]),
      },
    })
  )

  return ids.map((id) => items.find((item) => item.id === id) || undefined)
}

export const getItemUrl = (id: string) => `${env.client.url}/me/${id}`

const markItemAsRead = async (libraryItemId: string, userId: string) => {
  return await readingProgressDataSource.updateReadingProgress(
    userId,
    libraryItemId,
    {
      readingProgressPercent: 100,
      readingProgressTopPercent: 100,
      readingProgressAnchorIndex: undefined,
    }
  )
}

const handleNoCase = (value: string) => {
  const keywordRegexMap: Record<string, RegExp> = {
    highlight: /^highlight(s)?$/i,
    label: /^label(s)?$/i,
    subscription: /^subscription(s)?$/i,
  }

  const matchingKeyword = Object.keys(keywordRegexMap).find((keyword) =>
    value.match(keywordRegexMap[keyword])
  )

  if (matchingKeyword) {
    const column = getColumnName(matchingKeyword)
    return `(library_item.${column} IS NULL OR library_item.${column} = '{}')`
  }

  throw new Error(`Unexpected keyword: ${value}`)
}

export const sortParamsToSort = (
  sortParams: InputMaybe<SortParams> | undefined
) => {
  const sort = { by: SortBy.UPDATED, order: SortOrder.DESCENDING }

  if (sortParams) {
    sortParams.order === 'ASCENDING' && (sort.order = SortOrder.ASCENDING)
    switch (sortParams.by) {
      case 'UPDATED_TIME':
        sort.by = SortBy.UPDATED
        break
      case 'PUBLISHED_AT':
        sort.by = SortBy.PUBLISHED
        break
      case 'SAVED_AT':
        sort.by = SortBy.SAVED
        break
    }
  }

  return sort
}

const getColumnName = (field: string) => {
  const lowerCaseField = field.toLowerCase()
  switch (lowerCaseField) {
    case 'language':
      return 'item_language'
    case 'subscription':
    case 'rss':
      return 'subscription'
    case 'site':
      return 'site_name'
    case 'wordscount':
      return 'word_count'
    case 'readposition':
      return 'reading_progress_bottom_percent'
    case 'saved':
    case 'read':
    case 'updated':
    case 'published':
      return `${lowerCaseField}_at`
    case 'author':
    case 'title':
    case 'description':
    case 'note':
      return lowerCaseField
    case 'highlight':
      return 'highlight_annotations'
    case 'label':
      return 'label_names'
    default:
      throw new Error(`Unexpected field: ${field}`)
  }
}

export const buildQueryString = (
  searchQuery: LiqeQuery,
  parameters: ObjectLiteral[] = [],
  selects: Select[] = [],
  orders: Sort[] = [],
  useFolders = false
) => {
  const escapeQueryWithParameters = (
    query: string,
    parameter: ObjectLiteral
  ) => {
    parameters.push(parameter)
    return query
  }

  const serializeImplicitField = (
    expression: ExpressionToken
  ): string | null => {
    if (expression.type !== 'LiteralExpression') {
      throw new Error('Expected a literal expression')
    }

    const value = expression.value?.toString()

    if (value === undefined || value === '') {
      return null
    }

    const param = `implicit_field_${parameters.length}`
    const alias = `rank_${parameters.length}`
    selects.push({
      column: `ts_rank_cd(library_item.search_tsv, websearch_to_tsquery('english', :${param}))`,
      alias,
    })

    orders.push({ by: alias, order: SortOrder.DESCENDING })

    return escapeQueryWithParameters(
      `websearch_to_tsquery('english', :${param}) @@ library_item.search_tsv`,
      { [param]: value }
    )
  }

  const serializeTagExpression = (ast: LiqeQuery): string | null => {
    if (ast.type !== 'Tag') {
      throw new Error('Expected a tag expression')
    }

    const { field, expression } = ast

    if (field.type === 'ImplicitField') {
      return serializeImplicitField(expression)
    } else {
      if (expression.type !== 'LiteralExpression') {
        // ignore empty values
        return null
      }

      const value = expression.value?.toString()
      if (!value) {
        // ignore empty values
        return null
      }

      switch (field.name.toLowerCase()) {
        case 'in': {
          switch (value.toLowerCase()) {
            case InFilter.ALL:
              return null
            case InFilter.ARCHIVE:
              return `(library_item.state = 'ARCHIVED' 
                        OR (library_item.state IN ('SUCCEEDED', 'ARCHIVED', 'PROCESSING', 'FAILED', 'CONTENT_NOT_FETCHED') 
                          AND library_item.archived_at IS NOT NULL))`
            case InFilter.TRASH:
              // return only deleted pages within 14 days
              return "(library_item.state = 'DELETED' AND library_item.deleted_at >= NOW() - INTERVAL '14 days')"
            default: {
              let sql = 'library_item.archived_at IS NULL'
              if (useFolders) {
                const param = `folder_${parameters.length}`
                const folderSql = escapeQueryWithParameters(
                  `library_item.folder = :${param}`,
                  { [param]: value }
                )
                sql = `(${sql} AND ${folderSql})`
              }

              return sql
            }
          }
        }

        case 'is': {
          switch (value.toLowerCase()) {
            case ReadFilter.READ:
              return 'library_item.reading_progress_bottom_percent > 98'
            case ReadFilter.READING:
              return 'library_item.reading_progress_bottom_percent BETWEEN 2 AND 98'
            case ReadFilter.UNREAD:
              return 'library_item.reading_progress_bottom_percent < 2'
            case ReadFilter.SEEN:
              return 'library_item.seen_at IS NOT NULL'
            default:
              throw new Error(`Unexpected keyword: ${value}`)
          }
        }
        case 'type': {
          const param = `type_${parameters.length}`

          return escapeQueryWithParameters(
            `LOWER(library_item.item_type) = :${param}`,
            {
              [param]: value.toLowerCase(),
            }
          )
        }
        case 'label': {
          const labels = value.toLowerCase().split(',')
          return (
            labels
              .map((label) => {
                const param = `label_${parameters.length}`

                const hasWildcard = label.includes('*')
                if (hasWildcard) {
                  return escapeQueryWithParameters(
                    `exists (select 1 from unnest(array_cat(library_item.label_names, library_item.highlight_labels)::text[]) as label where label ILIKE :${param})`,
                    {
                      [param]: label.replace(/\*/g, '%'),
                    }
                  )
                }

                return escapeQueryWithParameters(
                  `:${param} = ANY(lower(array_cat(library_item.label_names, library_item.highlight_labels)::text)::text[])`,
                  {
                    [param]: label,
                  }
                )
              })
              .join(' OR ')
              // wrap in brackets to avoid precedence issues
              .replace(/^(.*)$/, '($1)')
          )
        }
        case 'sort': {
          const [sort, sortOrder] = value.toLowerCase().split('-')
          const matchingSortBy = Object.values(SortBy).find(
            (sortBy) => sortBy === sort
          )
          if (!matchingSortBy) {
            return null
          }
          const column = getColumnName(matchingSortBy)

          const order =
            sortOrder === 'asc' ? SortOrder.ASCENDING : SortOrder.DESCENDING
          const nulls =
            order === SortOrder.ASCENDING ? 'NULLS FIRST' : 'NULLS LAST'

          orders.push({ by: `library_item.${column}`, order, nulls })
          return null
        }
        case 'has':
          return `NOT (${handleNoCase(value)})`
        case 'saved':
        case 'read':
        case 'updated':
        case 'published': {
          let startDate: Date | undefined
          let endDate: Date | undefined
          // check for special date filters
          switch (value.toLowerCase()) {
            case 'today':
              startDate = DateTime.local().startOf('day').toJSDate()
              break
            case 'yesterday': {
              const yesterday = DateTime.local().minus({ days: 1 })
              startDate = yesterday.startOf('day').toJSDate()
              endDate = yesterday.endOf('day').toJSDate()
              break
            }
            case 'last12hrs':
              {
                const ago = new Date()
                ago.setHours(ago.getHours() - 12)
                startDate = ago
              }
              break
            case 'last24hrs':
              {
                const ago = new Date()
                ago.setHours(ago.getHours() - 24)
                startDate = ago
              }
              break
            case 'this week':
              startDate = DateTime.local().startOf('week').toJSDate()
              break
            case 'this month':
              startDate = DateTime.local().startOf('month').toJSDate()
              break
            default: {
              // check for date ranges
              const [start, end] = value.split('..')
              // validate date
              if (start && start !== '*') {
                startDate = new Date(start)
                if (isNaN(startDate.getTime())) {
                  throw new Error('Invalid start date')
                }
              }

              if (end && end !== '*') {
                endDate = new Date(end)
                if (isNaN(endDate.getTime())) {
                  throw new Error('Invalid end date')
                }
              }
            }
          }

          const startParam = `${field.name}_start_${parameters.length}`
          const endParam = `${field.name}_end_${parameters.length}`

          return escapeQueryWithParameters(
            `library_item.${field.name}_at BETWEEN :${startParam} AND :${endParam}`,
            {
              [startParam]: startDate ?? new Date(0),
              [endParam]: endDate ?? new Date(),
            }
          )
        }
        // term filters
        case 'subscription':
        case 'rss':
        case 'language': {
          const columnName = getColumnName(field.name)
          const param = `term_${field.name}_${parameters.length}`

          return escapeQueryWithParameters(
            `library_item.${columnName} = :${param}`,
            {
              [param]: value,
            }
          )
        }
        // match filters
        case 'author':
        case 'title':
        case 'description':
        case 'note':
        case 'site': {
          const columnName = getColumnName(field.name)
          const param = `match_${field.name}_${parameters.length}`
          const wildcardParam = `match_${field.name}_wildcard_${parameters.length}`

          return escapeQueryWithParameters(
            `(websearch_to_tsquery('english', :${param}) @@ library_item.${columnName}_tsv OR library_item.${columnName} ILIKE :${wildcardParam})`,
            {
              [param]: value,
              [wildcardParam]: `%${value}%`,
            }
          )
        }
        case 'includes': {
          const ids = value.split(',')
          if (!ids || ids.length === 0) {
            throw new Error('Expected ids')
          }

          const param = `includes_${parameters.length}`

          return escapeQueryWithParameters(`library_item.id = ANY(:${param})`, {
            [param]: ids,
          })
        }
        case 'recommendedby': {
          const param = `recommendedBy_${parameters.length}`
          if (value === '*') {
            // select all if * is provided
            return "library_item.recommender_names <> '{}'"
          }

          return escapeQueryWithParameters(
            `:${param} = ANY(lower(library_item.recommender_names::text)::text[])`,
            {
              [param]: value.toLowerCase(),
            }
          )
        }
        case 'no':
          return handleNoCase(value)
        case 'use':
        case 'mode':
        case 'event':
          // mode is ignored and used only by the frontend
          return null
        case 'readposition':
        case 'wordscount': {
          const column = getColumnName(field.name)

          const operatorRegex = /([<>]=?)/
          const operator = value.match(operatorRegex)?.[0]
          if (!operator) {
            throw new Error('Expected operator')
          }

          const newValue = value.replace(operatorRegex, '')

          const param = `range_${field.name}_${parameters.length}`

          return escapeQueryWithParameters(
            `library_item.${column} ${operator} :${param}`,
            {
              [param]: parseInt(newValue, 10),
            }
          )
        }
        default:
          // treat unknown fields as implicit fields
          return serializeImplicitField({
            ...expression,
            value: `${field.name}:${value}`,
          })
      }
    }
  }

  const serialize = (ast: LiqeQuery): string | null => {
    if (ast.type === 'Tag') {
      return serializeTagExpression(ast)
    }

    if (ast.type === 'LogicalExpression') {
      let operator = ''
      if (ast.operator.operator === 'AND') {
        operator = 'AND'
      } else if (ast.operator.operator === 'OR') {
        operator = 'OR'
      } else {
        throw new Error('Unexpected operator')
      }

      const left = serialize(ast.left)
      const right = serialize(ast.right)

      if (!left && !right) {
        return null
      }

      if (!left) {
        return right
      }

      if (!right) {
        return left
      }

      return `${left} ${operator} ${right}`
    }

    if (ast.type === 'UnaryOperator') {
      const serialized = serialize(ast.operand)

      if (!serialized) {
        return null
      }

      return `NOT ${serialized}`
    }

    if (ast.type === 'ParenthesizedExpression') {
      const serialized = serialize(ast.expression)

      if (!serialized) {
        return null
      }

      return `(${serialized})`
    }

    return null
  }

  return serialize(searchQuery)
}

export const createSearchQueryBuilder = (
  args: SearchArgs,
  userId: string,
  em = appDataSource.manager
) => {
  const queryBuilder = em.createQueryBuilder(LibraryItem, 'library_item')

  // select all columns except content
  const selects: Select[] = getColumns(libraryItemRepository)
    .filter(
      (select) =>
        select !== 'originalContent' && // exclude original content
        (args.includeContent || select !== 'readableContent') // exclude content if not requested
    )
    .map((column) => ({ column: `library_item.${column}` }))

  const parameters: ObjectLiteral[] = []
  const orders: Sort[] = []
  let queryString: string | null = null

  if (args.query) {
    const searchQuery = parseSearchQuery(args.query)

    // build query string and save parameters
    queryString = buildQueryString(
      searchQuery,
      parameters,
      selects,
      orders,
      args.useFolders
    )
  }

  // add select
  selects.forEach((select, index) => {
    // select must be defined before adding additional selects
    index === 0
      ? queryBuilder.select(select.column, select.alias)
      : queryBuilder.addSelect(select.column, select.alias)
  })

  queryBuilder.where('library_item.user_id = :userId', { userId })

  if (!args.includePending) {
    queryBuilder.andWhere("library_item.state <> 'PROCESSING'")
  }

  if (!args.includeDeleted) {
    queryBuilder.andWhere(
      "library_item.state IN ('SUCCEEDED', 'ARCHIVED', 'PROCESSING', 'FAILED', 'CONTENT_NOT_FETCHED')"
    )
  }

  if (queryString) {
    // add where clause from query string
    queryBuilder
      .andWhere(`(${queryString})`)
      .setParameters(paramtersToObject(parameters))
  }

  // default order by saved at descending
  if (!orders.find((order) => order.by === 'library_item.saved_at')) {
    orders.push({
      by: 'library_item.saved_at',
      order: SortOrder.DESCENDING,
      nulls: 'NULLS LAST',
    })
  }

  // add order by
  orders.forEach((order) => {
    queryBuilder.addOrderBy(order.by, order.order, order.nulls)
  })

  return queryBuilder
}

export const countLibraryItems = async (args: SearchArgs, userId: string) => {
  return authTrx(
    async (tx) => createSearchQueryBuilder(args, userId, tx).getCount(),
    undefined,
    userId
  )
}

export const searchLibraryItems = async (
  args: SearchArgs,
  userId: string
): Promise<LibraryItem[]> => {
  const { from = 0, size = 10 } = args

  if (size === 0) {
    // return only count if size is 0 because limit 0 is not allowed in typeorm
    return []
  }

  return authTrx(
    async (tx) =>
      createSearchQueryBuilder(args, userId, tx)
        .skip(from)
        .take(size)
        .getMany(),
    undefined,
    userId
  )
}

export const searchAndCountLibraryItems = async (
  args: SearchArgs,
  userId: string
): Promise<{ libraryItems: LibraryItem[]; count: number }> => {
  const count = await countLibraryItems(args, userId)
  if (count === 0) {
    return { libraryItems: [], count }
  }

  const libraryItems = await searchLibraryItems(args, userId)

  return { libraryItems, count }
}

export const findRecentLibraryItems = async (
  userId: string,
  limit = 1000,
  offset?: number
) => {
  const selectColumns = getColumns(libraryItemRepository)
    .filter(
      (column) => column !== 'readableContent' && column !== 'originalContent'
    )
    .map((column) => `library_item.${column}`)

  return authTrx(
    async (tx) =>
      tx
        .createQueryBuilder(LibraryItem, 'library_item')
        .select(selectColumns)
        .leftJoinAndSelect('library_item.labels', 'labels')
        .leftJoinAndSelect('library_item.highlights', 'highlights')
        .where(
          'library_item.user_id = :userId AND library_item.state = :state',
          { userId, state: LibraryItemState.Succeeded }
        )
        .orderBy('library_item.savedAt', 'DESC', 'NULLS LAST')
        .take(limit)
        .skip(offset)
        .getMany(),
    undefined,
    userId
  )
}

export const findLibraryItemsByIds = async (
  ids: string[],
  userId?: string,
  options?: {
    select?: (keyof LibraryItem)[]
  }
) => {
  const selectColumns =
    options?.select?.map((column) => `library_item.${column}`) ||
    getColumns(libraryItemRepository)
      .filter((column) => column !== 'originalContent')
      .map((column) => `library_item.${column}`)
  return authTrx(
    async (tx) =>
      tx
        .createQueryBuilder(LibraryItem, 'library_item')
        .select(selectColumns)
        .where('library_item.id IN (:...ids)', { ids })
        .getMany(),
    undefined,
    userId
  )
}

export const findLibraryItemById = async (
  id: string,
  userId: string,
  options?: {
    select?: (keyof LibraryItem)[]
    relations?: {
      user?: boolean
      labels?: boolean
      highlights?:
        | {
            user?: boolean
          }
        | boolean
    }
  }
): Promise<LibraryItem | null> => {
  return authTrx(
    async (tx) =>
      tx.withRepository(libraryItemRepository).findOne({
        select: options?.select,
        where: { id },
        relations: options?.relations,
      }),
    undefined,
    userId
  )
}

export const findLibraryItemByUrl = async (
  url: string,
  userId: string
): Promise<LibraryItem | null> => {
  return authTrx(
    async (tx) =>
      tx
        .createQueryBuilder(LibraryItem, 'library_item')
        .leftJoinAndSelect('library_item.labels', 'labels')
        .leftJoinAndSelect('library_item.highlights', 'highlights')
        .leftJoinAndSelect('library_item.recommendations', 'recommendations')
        .leftJoinAndSelect('recommendations.recommender', 'recommender')
        .leftJoinAndSelect('recommender.profile', 'profile')
        .leftJoinAndSelect('recommendations.group', 'group')
        .where('library_item.user_id = :userId', { userId })
        .andWhere('md5(library_item.original_url) = md5(:url)', { url })
        .getOne(),
    undefined,
    userId
  )
}

export const restoreLibraryItem = async (
  id: string,
  userId: string,
  pubsub = createPubSubClient()
): Promise<LibraryItem> => {
  return updateLibraryItem(
    id,
    {
      state: LibraryItemState.Succeeded,
      savedAt: new Date(),
      archivedAt: null,
      deletedAt: null,
    },
    userId,
    pubsub
  )
}

export const softDeleteLibraryItem = async (
  id: string,
  userId: string,
  pubsub = createPubSubClient()
): Promise<LibraryItem> => {
  const deletedLibraryItem = await authTrx(
    async (tx) => {
      const itemRepo = tx.withRepository(libraryItemRepository)

      // mark item as deleted
      await itemRepo.update(id, {
        state: LibraryItemState.Deleted,
        deletedAt: new Date(),
        seenAt: new Date(),
      })

      return itemRepo.findOneByOrFail({ id })
    },
    undefined,
    userId
  )

  await pubsub.entityDeleted(EntityType.ITEM, id, userId)

  return deletedLibraryItem
}

export const updateLibraryItem = async (
  id: string,
  libraryItem: QueryDeepPartialEntity<LibraryItem>,
  userId: string,
  pubsub = createPubSubClient(),
  skipPubSub = false
): Promise<LibraryItem> => {
  const updatedLibraryItem = await authTrx(
    async (tx) => {
      const itemRepo = tx.withRepository(libraryItemRepository)

      // reset archivedAt
      switch (libraryItem.state) {
        case LibraryItemState.Archived:
          libraryItem.archivedAt = new Date()
          break
        case LibraryItemState.Processing:
        case LibraryItemState.Succeeded:
          libraryItem.archivedAt = null
          libraryItem.deletedAt = null
          break
      }
      await itemRepo.update(id, libraryItem)

      return itemRepo.findOneByOrFail({ id })
    },
    undefined,
    userId
  )

  if (skipPubSub || libraryItem.state === LibraryItemState.Processing) {
    return updatedLibraryItem
  }

  if (libraryItem.state === LibraryItemState.Succeeded) {
    const data = deepDelete(updatedLibraryItem, columnsToDelete)
    // send create event if the item was created
    await pubsub.entityCreated<ItemEvent>(EntityType.ITEM, data, userId)

    return updatedLibraryItem
  }

  const data = deepDelete(libraryItem, columnsToDelete)
  await pubsub.entityUpdated<ItemEvent>(
    EntityType.ITEM,
    {
      ...data,
      id,
    } as ItemEvent,
    userId
  )

  return updatedLibraryItem
}

export const updateLibraryItemReadingProgress = async (
  id: string,
  userId: string,
  bottomPercent: number,
  topPercent: number | null = null,
  anchorIndex: number | null = null,
  pubsub = createPubSubClient()
): Promise<LibraryItem | null> => {
  // If we have a top percent, we only save it if it's greater than the current top percent
  // or set to zero if the top percent is zero.
  const result = (await authTrx(
    async (tx) =>
      tx.getRepository(LibraryItem).query(
        `
      UPDATE omnivore.library_item
      SET reading_progress_top_percent = CASE
        WHEN reading_progress_top_percent < $2 THEN $2
        WHEN $2 = 0 THEN 0
        ELSE reading_progress_top_percent
      END,
      reading_progress_bottom_percent = CASE
        WHEN reading_progress_bottom_percent < $3 THEN $3
        WHEN $3 = 0 THEN 0
        ELSE reading_progress_bottom_percent
      END,
      reading_progress_highest_read_anchor = CASE
        WHEN reading_progress_top_percent < $4 THEN $4
        WHEN $4 = 0 THEN 0
        ELSE reading_progress_highest_read_anchor
      END,
      read_at = now()
      WHERE id = $1 AND (
        (reading_progress_top_percent < $2 OR $2 = 0) OR
        (reading_progress_bottom_percent < $3 OR $3 = 0) OR
        (reading_progress_highest_read_anchor < $4 OR $4 = 0)
      )
      RETURNING
        id,
        reading_progress_top_percent as "readingProgressTopPercent",
        reading_progress_bottom_percent as "readingProgressBottomPercent",
        reading_progress_highest_read_anchor as "readingProgressHighestReadAnchor",
        read_at as "readAt"
      `,
        [id, topPercent, bottomPercent, anchorIndex]
      ),
    undefined,
    userId
  )) as [LibraryItem[], number]
  if (result[1] === 0) {
    return null
  }

  const updatedItem = result[0][0]
  await pubsub.entityUpdated<ItemEvent>(EntityType.ITEM, updatedItem, userId)

  return updatedItem
}

export const createLibraryItems = async (
  libraryItems: DeepPartial<LibraryItem>[],
  userId: string
): Promise<LibraryItem[]> => {
  return authTrx(
    async (tx) => tx.withRepository(libraryItemRepository).save(libraryItems),
    undefined,
    userId
  )
}

export type CreateOrUpdateLibraryItemArgs = Merge<
  DeepPartial<LibraryItem>,
  { originalUrl: string }
>
export const createOrUpdateLibraryItem = async (
  libraryItem: CreateOrUpdateLibraryItemArgs,
  userId: string,
  pubsub = createPubSubClient(),
  skipPubSub = false,
  originalContentUploaded = false
): Promise<LibraryItem> => {
  let originalContent: string | null = null
  if (libraryItem.originalContent) {
    originalContent = libraryItem.originalContent

    // remove original content from the item
    delete libraryItem.originalContent
  }

  const newLibraryItem = await authTrx(
    async (tx) => {
      const repo = tx.withRepository(libraryItemRepository)
      // find existing library item by user_id and url for update
      const existingLibraryItem = await repo.findByUserIdAndUrl(
        userId,
        libraryItem.originalUrl,
        true
      )

      if (existingLibraryItem) {
        const id = existingLibraryItem.id

        try {
          // delete labels and highlights if the item was deleted
          if (existingLibraryItem.state === LibraryItemState.Deleted) {
            logger.info('Deleting labels and highlights for item', {
              id,
            })
            await tx.getRepository(Highlight).delete({
              libraryItem: { id: existingLibraryItem.id },
            })

            await tx.getRepository(EntityLabel).delete({
              libraryItemId: existingLibraryItem.id,
            })

            libraryItem.labelNames = []
            libraryItem.highlightAnnotations = []
          }
        } catch (error) {
          // continue to save the item even if we failed to delete labels and highlights
          logger.error('Failed to delete labels and highlights', error)
        }

        // update existing library item
        const newItem = await repo.save({
          ...libraryItem,
          id,
          slug: existingLibraryItem.slug, // keep the original slug
        })

        // delete the new item if it's different from the existing one
        if (libraryItem.id && libraryItem.id !== id) {
          await repo.delete(libraryItem.id)
        }

        return newItem
      }

      // create or update library item
      return repo.upsertLibraryItemById(libraryItem)
    },
    undefined,
    userId
  )

  // set recently saved item in redis if redis is enabled
  if (redisDataSource.redisClient) {
    await setRecentlySavedItemInRedis(
      redisDataSource.redisClient,
      userId,
      newLibraryItem.originalUrl
    )
  }

  if (skipPubSub || libraryItem.state === LibraryItemState.Processing) {
    return newLibraryItem
  }

  const data = deepDelete(newLibraryItem, columnsToDelete)
  await pubsub.entityCreated<ItemEvent>(EntityType.ITEM, data, userId)

  // upload original content to GCS in a job if it's not already uploaded
  if (originalContent && !originalContentUploaded) {
    try {
      await enqueueUploadOriginalContent(
        userId,
        newLibraryItem.id,
        newLibraryItem.savedAt,
        originalContent
      )

      logger.info('Queued to upload original content in GCS', {
        id: newLibraryItem.id,
      })
    } catch (error) {
      logError(error)
    }
  }

  return newLibraryItem
}

export const findLibraryItemsByPrefix = async (
  prefix: string,
  userId: string,
  limit = 5
): Promise<LibraryItem[]> => {
  const prefixWildcard = `${prefix}%`

  return authTrx(async (tx) =>
    tx
      .createQueryBuilder(LibraryItem, 'library_item')
      .where('library_item.user_id = :userId', { userId })
      .andWhere(
        '(library_item.title ILIKE :prefix OR library_item.site_name ILIKE :prefix)',
        { prefix: prefixWildcard }
      )
      .orderBy('library_item.savedAt', 'DESC')
      .limit(limit)
      .getMany()
  )
}

export const countBySavedAt = async (
  userId: string,
  startDate = new Date(0),
  endDate = new Date()
): Promise<number> => {
  return authTrx(
    async (tx) =>
      tx
        .createQueryBuilder(LibraryItem, 'library_item')
        .where('library_item.user_id = :userId', { userId })
        .andWhere('library_item.saved_at between :startDate and :endDate', {
          startDate,
          endDate,
        })
        .getCount(),
    undefined,
    userId
  )
}

export const batchUpdateLibraryItems = async (
  action: BulkActionType,
  searchArgs: SearchArgs,
  userId: string,
  labelIds?: string[] | null,
  args?: unknown
) => {
  if (!searchArgs.query) {
    throw new Error('Search query is required')
  }

  const searchQuery = parseSearchQuery(searchArgs.query)
  const parameters: ObjectLiteral[] = []
  const queryString = buildQueryString(searchQuery, parameters)
  interface FolderArguments {
    folder: string
  }

  const isFolderArguments = (args: any): args is FolderArguments => {
    return 'folder' in args
  }

  const getQueryBuilder = (userId: string, em: EntityManager) => {
    const queryBuilder = em
      .createQueryBuilder(LibraryItem, 'library_item')
      .where('library_item.user_id = :userId', { userId })
    if (queryString) {
      queryBuilder
        .andWhere(`(${queryString})`)
        .setParameters(paramtersToObject(parameters))
    }
    return queryBuilder
  }

  const getLibraryItemIds = async (
    userId: string,
    em: EntityManager,
    forUpdate = false
  ): Promise<string[]> => {
    const queryBuilder = getQueryBuilder(userId, em)

    if (forUpdate) {
      queryBuilder.setLock('pessimistic_write')
    }

    const libraryItems = await queryBuilder
      .select('library_item.id', 'id')
      .take(searchArgs.size)
      .skip(searchArgs.from)
      .getRawMany<{ id: string }>()

    return libraryItems.map((item) => item.id)
  }

  const now = new Date().toISOString()
  // build the script
  let values: Record<string, string | number> = {}
  switch (action) {
    case BulkActionType.Archive:
      values = {
        archivedAt: now,
        state: LibraryItemState.Archived,
      }
      break
    case BulkActionType.Delete:
      values = {
        state: LibraryItemState.Deleted,
        deletedAt: now,
      }
      break
    case BulkActionType.AddLabels: {
      if (!labelIds) {
        throw new Error('Labels are required for this action')
      }

      const libraryItemIds = await authTrx(
        async (tx) => getLibraryItemIds(userId, tx),
        undefined,
        userId
      )
      // add labels to library items
      for (const libraryItemId of libraryItemIds) {
        await addLabelsToLibraryItem(labelIds, libraryItemId, userId)
      }

      return
    }
    case BulkActionType.MarkAsRead: {
      const libraryItemIds = await authTrx(
        async (tx) => getLibraryItemIds(userId, tx),
        undefined,
        userId
      )
      // update reading progress for library items
      for (const libraryItemId of libraryItemIds) {
        await markItemAsRead(libraryItemId, userId)
      }

      return
    }
    case BulkActionType.MoveToFolder:
      if (!args || !isFolderArguments(args)) {
        throw new Error('Invalid arguments')
      }

      values = {
        folder: args.folder,
        savedAt: now,
      }

      break
    case BulkActionType.MarkAsSeen:
      values = {
        seenAt: now,
      }
      break
    default:
      throw new Error('Invalid bulk action')
  }

  await authTrx(
    async (tx) => {
      const libraryItemIds = await getLibraryItemIds(userId, tx, true)
      await tx.getRepository(LibraryItem).update(libraryItemIds, values)
    },
    undefined,
    userId
  )
}

export const deleteLibraryItemById = async (id: string, userId?: string) => {
  return authTrx(
    async (tx) => tx.withRepository(libraryItemRepository).delete(id),
    undefined,
    userId
  )
}

export const deleteLibraryItems = async (
  items: LibraryItem[],
  userId?: string
) => {
  return authTrx(
    async (tx) =>
      tx.withRepository(libraryItemRepository).delete(items.map((i) => i.id)),
    undefined,
    userId
  )
}

export const deleteLibraryItemByUrl = async (url: string, userId: string) => {
  return authTrx(
    async (tx) =>
      tx
        .withRepository(libraryItemRepository)
        .delete({ originalUrl: url, user: { id: userId } }),
    undefined,
    userId
  )
}

export const deleteLibraryItemsByUserId = async (userId: string) => {
  return authTrx(
    async (tx) =>
      tx.withRepository(libraryItemRepository).delete({
        user: { id: userId },
      }),
    undefined,
    userId
  )
}

export const batchDelete = async (criteria: FindOptionsWhere<LibraryItem>) => {
  const batchSize = 1000

  const qb = libraryItemRepository.createQueryBuilder().where(criteria)
  const countSql = queryBuilderToRawSql(qb.select('COUNT(1)'))
  const subQuery = queryBuilderToRawSql(qb.select('id').limit(batchSize))

  const sql = `
  -- Set batch size
  DO $$
  DECLARE 
      batch_size INT := ${batchSize};
  BEGIN
      -- Loop through batches
      FOR i IN 0..CEIL((${countSql}) * 1.0 / batch_size) - 1 LOOP
          -- Delete batch
          DELETE FROM omnivore.library_item
          WHERE id = ANY(
            ${subQuery}
          );
      END LOOP;
  END $$
  `

  return authTrx(async (t) => t.query(sql))
}

export const findLibraryItemIdsByLabelId = async (
  labelId: string,
  userId: string
) => {
  return authTrx(
    async (tx) => {
      // find library items have the label or have highlights with the label
      const result = (await tx.query(
        `
        SELECT library_item_id
        FROM (
            SELECT library_item_id
            FROM omnivore.entity_labels
            WHERE label_id = $1
                  AND library_item_id IS NOT NULL
            UNION
            SELECT h.library_item_id
            FROM omnivore.highlight h
            INNER JOIN omnivore.entity_labels ON entity_labels.highlight_id = h.id
            WHERE label_id = $1
                  AND highlight_id IS NOT NULL
        ) AS combined_results
      `,
        [labelId]
      )) as { library_item_id: string }[]

      return result.map((r) => r.library_item_id)
    },
    undefined,
    userId
  )
}

export const filterItemEvents = (
  ast: LiqeQuery,
  events: readonly ItemEvent[]
): ItemEvent[] => {
  const testNo = (value: string, event: ItemEvent) => {
    const keywordRegexMap: Record<string, RegExp> = {
      highlightAnnotations: /^highlight(s)?$/i,
      labelNames: /^label(s)?$/i,
      subscription: /^subscription(s)?$/i,
    }

    const keys = Object.keys(keywordRegexMap)
    const matchingKeyword = keys.find((keyword) =>
      value.match(keywordRegexMap[keyword])
    )

    if (!matchingKeyword) {
      throw new Error(`Unexpected keyword: ${value}`)
    }

    const eventValue = (event as PickTuple<ItemEvent, typeof keys>)[
      matchingKeyword
    ]

    return !eventValue || (Array.isArray(eventValue) && eventValue.length === 0)
  }

  const testEvent = (ast: LiqeQuery, event: ItemEvent) => {
    if (ast.type !== 'Tag') {
      throw new Error('Expected a tag expression.')
    }

    const { field, expression } = ast

    if (expression.type !== 'LiteralExpression') {
      // ignore empty values
      throw new Error('Expected a literal expression.')
    }

    const lowercasedValue = expression.value?.toString()?.toLowerCase()

    if (field.type === 'ImplicitField') {
      throw new RequiresSearchQueryError()
    }

    if (!lowercasedValue) {
      // ignore empty values
      throw new Error('Expected a non-empty value.')
    }

    switch (field.name.toLowerCase()) {
      case 'in': {
        switch (lowercasedValue) {
          case InFilter.ALL:
            return true
          case InFilter.ARCHIVE:
            return event.state === LibraryItemState.Archived
          case InFilter.TRASH:
            return event.state === LibraryItemState.Deleted
          default:
            return (
              event.state != LibraryItemState.Archived &&
              event.state != LibraryItemState.Deleted
            )
        }
      }

      case 'is': {
        switch (lowercasedValue) {
          case ReadFilter.READ:
            return (
              event.readingProgressBottomPercent &&
              event.readingProgressBottomPercent > 98
            )
          case ReadFilter.READING:
            return (
              event.readingProgressBottomPercent &&
              event.readingProgressBottomPercent >= 2 &&
              event.readingProgressBottomPercent <= 98
            )
          case ReadFilter.UNREAD:
            return (
              !event.readingProgressBottomPercent ||
              event.readingProgressBottomPercent < 2
            )
          default:
            throw new Error(`Unexpected keyword: ${lowercasedValue}`)
        }
      }
      case 'type': {
        return event.itemType?.toLowerCase() === lowercasedValue
      }
      case 'label': {
        const labels = event.labelNames as string[] | undefined
        const labelsToTest = lowercasedValue.split(',')
        return labelsToTest.some((label) => {
          const hasWildcard = label.includes('*')
          if (hasWildcard) {
            return labels?.some(
              (l) => l.match(new RegExp(label.replace('*', '.*'), 'i')) // match wildcard
            )
          }

          return labels?.some((l) => l.toLowerCase() === label)
        })
      }
      case 'has':
        return !testNo(lowercasedValue, event)
      case 'read':
      case 'updated':
      case 'published': {
        let startDate: Date | undefined
        let endDate: Date | undefined
        // check for special date filters
        switch (lowercasedValue) {
          case 'today':
            startDate = DateTime.local().startOf('day').toJSDate()
            break
          case 'yesterday': {
            const yesterday = DateTime.local().minus({ days: 1 })
            startDate = yesterday.startOf('day').toJSDate()
            endDate = yesterday.endOf('day').toJSDate()
            break
          }
          case 'this week':
            startDate = DateTime.local().startOf('week').toJSDate()
            break
          case 'this month':
            startDate = DateTime.local().startOf('month').toJSDate()
            break
          default: {
            // check for date ranges
            const [start, end] = lowercasedValue.split('..')
            // validate date
            if (start && start !== '*') {
              startDate = new Date(start)
              if (isNaN(startDate.getTime())) {
                throw new Error('Invalid start date')
              }
            }

            if (end && end !== '*') {
              endDate = new Date(end)
              if (isNaN(endDate.getTime())) {
                throw new Error('Invalid end date')
              }
            }
          }
        }

        const start = startDate ?? new Date(0)
        const end = endDate ?? new Date()
        const key = `${field.name.toLowerCase()}At`
        const eventValue = event[
          key as 'readAt' | 'updatedAt' | 'publishedAt'
        ] as Date

        return eventValue >= start && eventValue <= end
      }
      // term filters
      case 'subscription':
      case 'rss':
      case 'language': {
        const columnName = getColumnName(field.name)
        // get camel case column name
        const key = camelCase(columnName) as 'subscription' | 'itemLanguage'

        return event[key]?.toLowerCase() === lowercasedValue
      }
      // match filters
      case 'note':
        throw new RequiresSearchQueryError()
      case 'author':
      case 'title':
      case 'description': {
        const key = field.name as 'author' | 'title' | 'description'

        return event[key]?.toString()?.toLowerCase().includes(lowercasedValue)
      }
      case 'site': {
        const keys = ['siteName', 'originalUrl'] as const

        return keys.some((key) => {
          return event[key]?.toLowerCase().includes(lowercasedValue)
        })
      }
      case 'includes': {
        const ids = lowercasedValue.split(',')
        if (!ids || ids.length === 0) {
          throw new Error('Expected ids')
        }

        return event.id && ids.includes(event.id)
      }
      case 'recommendedby': {
        if (!event.recommenderNames) {
          return false
        }

        if (lowercasedValue === '*') {
          // select all if * is provided
          return event.recommenderNames.length > 0
        }

        return (event.recommenderNames as string[]).some(
          (name) => name.toLowerCase() === lowercasedValue
        )
      }
      case 'no':
        return testNo(lowercasedValue, event)
      case 'use':
      case 'mode':
      case 'event':
        // mode is ignored and used only by the frontend
        return true
      case 'readposition':
      case 'wordscount': {
        const operatorRegex = /([<>]=?)/
        const operator = lowercasedValue.match(operatorRegex)?.[0]
        if (!operator) {
          throw new Error('Expected operator')
        }

        const newValue = lowercasedValue.replace(operatorRegex, '')
        const intValue = parseInt(newValue, 10)

        const column = getColumnName(field.name)
        const key = camelCase(column) as
          | 'wordCount'
          | 'readingProgressBottomPercent'
        const eventValue = event[key] as number

        switch (operator) {
          case '>':
            return eventValue > intValue
          case '>=':
            return eventValue >= intValue
          case '<':
            return eventValue < intValue
          case '<=':
            return eventValue <= intValue
          default:
            throw new Error('Unexpected operator')
        }
      }
      default:
        throw new RequiresSearchQueryError()
    }
  }

  if (ast.type === 'Tag') {
    return events.filter((event) => {
      return testEvent(ast, event)
    })
  }

  if (ast.type === 'UnaryOperator') {
    const removeRows = filterItemEvents(ast.operand, events)

    return events.filter((event) => {
      return !removeRows.includes(event)
    })
  }

  if (ast.type === 'ParenthesizedExpression') {
    return filterItemEvents(ast.expression, events)
  }

  if (!ast.left) {
    throw new Error('Expected left to be defined.')
  }

  const leftRows = filterItemEvents(ast.left, events)

  if (!ast.right) {
    throw new Error('Expected right to be defined.')
  }

  if (ast.type !== 'LogicalExpression') {
    throw new Error('Expected a tag expression.')
  }

  if (ast.operator.operator === 'OR') {
    const rightRows = filterItemEvents(ast.right, events)

    return Array.from(new Set([...leftRows, ...rightRows]))
  } else if (ast.operator.operator === 'AND') {
    return filterItemEvents(ast.right, leftRows)
  }

  throw new Error('Unexpected state.')
}

export const enqueueUploadOriginalContent = async (
  userId: string,
  libraryItemId: string,
  savedAt: Date,
  originalContent: string
) => {
  const filePath = contentFilePath({
    userId,
    libraryItemId,
    savedAt,
    format: 'original',
  })
  await enqueueBulkUploadContentJob([
    {
      userId,
      libraryItemId,
      filePath,
      format: 'original',
      content: originalContent,
    },
  ])
}

export const downloadOriginalContent = async (
  userId: string,
  libraryItemId: string,
  savedAt: Date
) => {
  return downloadFromBucket(
    contentFilePath({
      userId,
      libraryItemId,
      savedAt,
      format: 'original',
    })
  )
}
