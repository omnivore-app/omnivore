import { LiqeQuery } from 'liqe'
import { DateTime } from 'luxon'
import { DeepPartial, ObjectLiteral } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { EntityLabel } from '../entity/entity_label'
import { Highlight } from '../entity/highlight'
import { Label } from '../entity/label'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { BulkActionType, InputMaybe, SortParams } from '../generated/graphql'
import { createPubSubClient, EntityType } from '../pubsub'
import { authTrx, getColumns } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { SaveFollowingItemRequest } from '../routers/svc/following'
import { generateSlug, wordsCount } from '../utils/helpers'
import { createThumbnailUrl } from '../utils/imageproxy'
import { parseSearchQuery } from '../utils/search'

enum ReadFilter {
  ALL = 'all',
  READ = 'read',
  READING = 'reading',
  UNREAD = 'unread',
}

enum InFilter {
  ALL = 'all',
  INBOX = 'inbox',
  ARCHIVE = 'archive',
  TRASH = 'trash',
  FOLLOWING = 'following',
}

enum HasFilter {
  HIGHLIGHTS = 'highlights',
  LABELS = 'labels',
  SUBSCRIPTIONS = 'subscriptions',
}

export interface SearchArgs {
  from?: number
  size?: number
  sort?: Sort
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
  SAVED = 'saved_at',
  UPDATED = 'updated_at',
  PUBLISHED = 'published_at',
  READ = 'read_at',
  WORDS_COUNT = 'word_count',
}

export enum SortOrder {
  ASCENDING = 'ASC',
  DESCENDING = 'DESC',
}

export interface Sort {
  by: SortBy
  order?: SortOrder
}

interface Select {
  column: string
  alias: string
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
  switch (field) {
    case 'language':
      return 'item_language'
    case 'subscription':
    case 'rss':
      return 'subscription'
    case 'site':
      return 'site_name'
    case 'wordsCount':
      return 'word_count'
    case 'readPosition':
      return 'reading_progress_bottom_percent'
    case 'saved':
    case 'read':
    case 'updated':
    case 'published':
      return `${field}_at`
    default:
      return field
  }
}

export const buildQuery = (
  searchQuery: LiqeQuery,
  parameters: ObjectLiteral[] = [],
  selects: Select[] = [],
  orders: { by: string; order?: SortOrder }[] = [],
  useFolders = false
) => {
  const escapeQueryWithParameters = (
    query: string,
    parameter: ObjectLiteral
  ) => {
    parameters.push(parameter)
    return query
  }

  const serializeTagExpression = (ast: LiqeQuery): string | null => {
    if (ast.type !== 'Tag') {
      throw new Error('Expected a tag expression.')
    }

    const { field, expression } = ast

    if (field.type === 'ImplicitField') {
      if (expression.type !== 'LiteralExpression') {
        throw new Error('Expected a literal expression.')
      }

      const value = expression.value?.toString()

      if (value === undefined || value === '') {
        return null
      }

      const param = 'implicit_field'
      const alias = 'rank'
      selects.push({
        column: `ts_rank_cd(library_item.search_tsv, websearch_to_tsquery('english', :${param}))`,
        alias,
      })

      orders.push({
        by: alias,
        order: SortOrder.DESCENDING,
      })

      return escapeQueryWithParameters(
        `websearch_to_tsquery('english', :${param}) @@ library_item.search_tsv`,
        { [param]: value }
      )
    } else {
      switch (field.name) {
        case 'in': {
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const folder = expression.value?.toString()
          if (!folder) {
            throw new Error('Expected a value.')
          }

          switch (folder) {
            case InFilter.ALL:
              return null
            case InFilter.ARCHIVE:
              return 'library_item.archived_at IS NOT NULL'
            case InFilter.TRASH:
              // return only deleted pages within 14 days
              return "library_item.deleted_at >= now() - interval '14 days'"
            default: {
              let sql = 'library_item.archived_at IS NULL'
              if (useFolders) {
                const param = `folder_${parameters.length}`
                const folderSql = escapeQueryWithParameters(
                  `library_item.folder = :${param}`,
                  { [param]: folder }
                )
                sql = `(${sql} AND ${folderSql})`
              }

              return sql
            }
          }
        }

        case 'is': {
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const value = expression.value?.toString()
          if (!value) {
            throw new Error('Expected a value.')
          }

          switch (value) {
            case ReadFilter.READ:
              return 'library_item.reading_progress_bottom_percent > 98'
            case ReadFilter.READING:
              return 'library_item.reading_progress_bottom_percent BETWEEN 2 AND 98'
            case ReadFilter.UNREAD:
              return 'library_item.reading_progress_bottom_percent < 2'
            default:
              throw new Error(`Unexpected keyword: ${value}`)
          }
        }
        case 'type': {
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const value = expression.value?.toString()
          if (!value) {
            throw new Error('Expected a value.')
          }

          const param = `type_${parameters.length}`

          return escapeQueryWithParameters(
            `LOWER(library_item.item_type) = :${param}`,
            {
              [param]: value.toLowerCase(),
            }
          )
        }
        case 'label': {
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const value = expression.value?.toString()?.toLowerCase()
          if (!value) {
            throw new Error('Expected a value.')
          }

          const labels = value.split(',')
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
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const value = expression.value?.toString()
          if (!value) {
            throw new Error('Expected a value.')
          }

          const [sort, sortOrder] = value.split('-')
          const order =
            sortOrder?.toUpperCase() === 'ASC'
              ? SortOrder.ASCENDING
              : SortOrder.DESCENDING

          const column = getColumnName(sort)
          orders.push({ by: `library_item.${column}`, order })
          return null
        }
        case 'has': {
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const value = expression.value?.toString()
          if (!value) {
            throw new Error('Expected a value.')
          }

          switch (value) {
            case HasFilter.HIGHLIGHTS:
              return "library_item.highlight_annotations <> '{}'"
            case HasFilter.LABELS:
              return "library_item.label_names <> '{}'"
            case HasFilter.SUBSCRIPTIONS:
              return 'library_item.subscription is NOT NULL'
            default:
              throw new Error(`Unexpected keyword: ${value}`)
          }
        }
        case 'saved':
        case 'read':
        case 'updated':
        case 'published': {
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const date = expression.value?.toString()
          if (!date) {
            throw new Error('Expected a value.')
          }

          let startDate: Date | undefined
          let endDate: Date | undefined
          // check for special date filters
          switch (date.toLowerCase()) {
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
              const [start, end] = date.split('..')
              startDate = start && start !== '*' ? new Date(start) : undefined
              endDate = end && end !== '*' ? new Date(end) : undefined
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
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const value = expression.value?.toString()
          if (!value) {
            throw new Error('Expected a value.')
          }

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
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          // normalize the term to lower case
          const value = expression.value?.toString()?.toLowerCase()
          if (!value) {
            throw new Error('Expected a value.')
          }

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
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const ids = expression.value?.toString()?.split(',')
          if (!ids || ids.length === 0) {
            throw new Error('Expected a value.')
          }

          const param = `includes_${parameters.length}`

          return escapeQueryWithParameters(`library_item.id = ANY(:${param})`, {
            [param]: ids,
          })
        }
        case 'recommendedBy': {
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const value = expression.value?.toString()
          if (!value) {
            throw new Error('Expected a value.')
          }

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
        case 'no': {
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          const value = expression.value?.toString()
          if (!value) {
            throw new Error('Expected a value.')
          }

          let column = ''
          switch (value) {
            case 'highlight':
              column = 'highlight_annotations'
              break
            case 'label':
              column = 'label_names'
              break
            case 'subscription':
              column = 'subscription'
              break
            default:
              throw new Error(`Unexpected keyword: ${value}`)
          }

          return `(library_item.${column} = '{}' OR library_item.${column} IS NULL)`
        }
        case 'use':
        case 'mode':
          // mode is ignored and used only by the frontend
          return null
        case 'readPosition':
        case 'wordsCount': {
          if (expression.type !== 'LiteralExpression') {
            throw new Error('Expected a literal expression.')
          }

          let value = expression.value?.toString()
          if (!value) {
            throw new Error('Expected a value.')
          }

          const column = getColumnName(field.name)

          const operatorRegex = /([<>]=?)/
          const operator = value.match(operatorRegex)?.[0]
          if (!operator) {
            throw new Error('Expected a value.')
          }

          value = value.replace(operatorRegex, '')
          if (!value) {
            throw new Error('Expected a value.')
          }

          const param = `range_${field.name}_${parameters.length}`

          return escapeQueryWithParameters(
            `library_item.${column} ${operator} :${param}`,
            {
              [param]: parseInt(value, 10),
            }
          )
        }
        default:
          throw new Error(`Unexpected keyword: ${field.name}`)
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
        throw new Error('Unexpected operator.')
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

    throw new Error('Missing AST type.')
  }

  return serialize(searchQuery)
}

export const searchLibraryItems = async (
  args: SearchArgs,
  userId: string
): Promise<{ libraryItems: LibraryItem[]; count: number }> => {
  const { from = 0, size = 10, sort } = args

  // default order is descending
  const sortOrder = sort?.order || SortOrder.DESCENDING
  // default sort by saved_at
  const sortField = sort?.by || SortBy.SAVED

  const selectColumns = getColumns(libraryItemRepository)
    .map((column) => `library_item.${column}`)
    .filter(
      (column) =>
        column !== 'library_item.readableContent' &&
        column !== 'library_item.originalContent'
    )

  let searchQuery: LiqeQuery | undefined
  if (args.query) {
    searchQuery = parseSearchQuery(args.query)
  }

  // add pagination and sorting
  return authTrx(
    async (tx) => {
      const queryBuilder = tx
        .createQueryBuilder(LibraryItem, 'library_item')
        .select(selectColumns)
        .where('library_item.user_id = :userId', { userId })

      if (searchQuery) {
        const parameters: ObjectLiteral[] = []
        const selects: Select[] = []
        const orders: Sort[] = []
        const whereClause = buildQuery(
          searchQuery,
          parameters,
          selects,
          orders,
          args.useFolders
        )
        whereClause &&
          queryBuilder
            .andWhere(whereClause)
            .setParameters(parameters.reduce((a, b) => ({ ...a, ...b }), {}))

        selects.forEach((select) => {
          queryBuilder.addSelect(select.column, select.alias)
        })

        // add order by
        orders.forEach((order) => {
          queryBuilder.addOrderBy(order.by, order.order, 'NULLS LAST')
        })
      }

      if (!args.includePending) {
        queryBuilder.andWhere("library_item.state <> 'PROCESSING'")
      }

      if (!args.includeDeleted) {
        queryBuilder.andWhere("library_item.state <> 'DELETED'")
      }

      const libraryItems = await queryBuilder
        .addOrderBy(`library_item.${sortField}`, sortOrder, 'NULLS LAST')
        .skip(from)
        .take(size)
        .getMany()

      const count = await queryBuilder.getCount()

      return { libraryItems, count }
    },
    undefined,
    userId
  )
}

export const findLibraryItemById = async (
  id: string,
  userId: string
): Promise<LibraryItem | null> => {
  return authTrx(
    async (tx) =>
      tx
        .createQueryBuilder(LibraryItem, 'library_item')
        .leftJoinAndSelect('library_item.labels', 'labels')
        .leftJoinAndSelect('library_item.highlights', 'highlights')
        .leftJoinAndSelect('highlights.user', 'user')
        .where('library_item.id = :id', { id })
        .getOne(),
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
        .andWhere('library_item.original_url = :url', { url })
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

export const updateLibraryItem = async (
  id: string,
  libraryItem: QueryDeepPartialEntity<LibraryItem>,
  userId: string,
  pubsub = createPubSubClient()
): Promise<LibraryItem> => {
  const updatedLibraryItem = await authTrx(
    async (tx) => {
      const itemRepo = tx.withRepository(libraryItemRepository)

      // reset deletedAt and archivedAt
      switch (libraryItem.state) {
        case LibraryItemState.Archived:
          libraryItem.archivedAt = new Date()
          break
        case LibraryItemState.Deleted:
          libraryItem.deletedAt = new Date()
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

  await pubsub.entityUpdated<QueryDeepPartialEntity<LibraryItem>>(
    EntityType.PAGE,
    {
      ...libraryItem,
      id,
      // don't send original content and readable content
      originalContent: undefined,
      readableContent: undefined,
    },
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
  await pubsub.entityUpdated<QueryDeepPartialEntity<LibraryItem>>(
    EntityType.PAGE,
    {
      id,
      readingProgressBottomPercent: updatedItem.readingProgressBottomPercent,
      readingProgressTopPercent: updatedItem.readingProgressTopPercent,
      readingProgressHighestReadAnchor:
        updatedItem.readingProgressHighestReadAnchor,
      readAt: updatedItem.readAt,
    },
    userId
  )

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

export const createLibraryItem = async (
  libraryItem: DeepPartial<LibraryItem>,
  userId: string,
  pubsub = createPubSubClient(),
  skipPubSub = false
): Promise<LibraryItem> => {
  const newLibraryItem = await authTrx(
    async (tx) =>
      tx.withRepository(libraryItemRepository).save({
        ...libraryItem,
        wordCount:
          libraryItem.wordCount ??
          wordsCount(libraryItem.readableContent || ''),
      }),
    undefined,
    userId
  )

  if (skipPubSub) {
    return newLibraryItem
  }

  await pubsub.entityCreated<DeepPartial<LibraryItem>>(
    EntityType.PAGE,
    {
      ...newLibraryItem,
      // don't send original content and readable content
      originalContent: undefined,
      readableContent: undefined,
    },
    userId
  )

  return newLibraryItem
}

export const saveFeedItemInFollowing = (
  input: SaveFollowingItemRequest,
  userId: string
) => {
  const thumbnail = input.thumbnail && createThumbnailUrl(input.thumbnail)

  return authTrx(
    async (tx) => {
      const itemToSave: QueryDeepPartialEntity<LibraryItem> = {
        ...input,
        user: { id: userId },
        originalUrl: input.url,
        subscription: input.addedToFollowingBy,
        folder: InFilter.FOLLOWING,
        slug: generateSlug(input.title),
        thumbnail,
      }

      return tx
        .getRepository(LibraryItem)
        .createQueryBuilder()
        .insert()
        .values(itemToSave)
        .orIgnore() // ignore if the item already exists
        .returning('*')
        .execute()
    },
    undefined,
    userId
  )
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

export const countByCreatedAt = async (
  userId: string,
  startDate = new Date(0),
  endDate = new Date()
): Promise<number> => {
  return authTrx(
    async (tx) =>
      tx
        .createQueryBuilder(LibraryItem, 'library_item')
        .where('library_item.user_id = :userId', { userId })
        .andWhere('library_item.created_at between :startDate and :endDate', {
          startDate,
          endDate,
        })
        .getCount(),
    undefined,
    userId
  )
}

export const updateLibraryItems = async (
  action: BulkActionType,
  query: string,
  userId: string,
  labels?: Label[],
  args?: unknown
) => {
  interface FolderArguments {
    folder: string
  }

  const isFolderArguments = (args: any): args is FolderArguments => {
    return 'folder' in args
  }

  // build the script
  let values: QueryDeepPartialEntity<LibraryItem> = {}
  let addLabels = false
  switch (action) {
    case BulkActionType.Archive:
      values = {
        archivedAt: new Date(),
        state: LibraryItemState.Archived,
      }
      break
    case BulkActionType.Delete:
      values = {
        state: LibraryItemState.Deleted,
        deletedAt: new Date(),
      }
      break
    case BulkActionType.AddLabels:
      addLabels = true
      break
    case BulkActionType.MarkAsRead:
      values = {
        readAt: new Date(),
        readingProgressTopPercent: 100,
        readingProgressBottomPercent: 100,
      }
      break
    case BulkActionType.MoveToFolder:
      if (!args || !isFolderArguments(args)) {
        throw new Error('Invalid arguments')
      }

      values = {
        folder: args.folder,
        savedAt: new Date(),
      }

      break
    default:
      throw new Error('Invalid bulk action')
  }

  const searchQuery = parseSearchQuery(query)

  await authTrx(async (tx) => {
    const queryBuilder = tx
      .createQueryBuilder(LibraryItem, 'library_item')
      .where('library_item.user_id = :userId', { userId })

    const parameters: ObjectLiteral[] = []
    const whereClause = buildQuery(searchQuery, parameters)
    if (whereClause) {
      queryBuilder
        .andWhere(whereClause)
        .setParameters(parameters.reduce((a, b) => ({ ...a, ...b }), {}))
    }

    if (addLabels) {
      if (!labels) {
        throw new Error('Labels are required for this action')
      }

      const libraryItems = await queryBuilder.getMany()
      // add labels in library items
      const labelsToAdd = libraryItems.flatMap((libraryItem) =>
        labels
          .map((label) => ({
            labelId: label.id,
            libraryItemId: libraryItem.id,
          }))
          .filter((entityLabel) => {
            const existingLabel = libraryItem.labels?.find(
              (l) => l.id === entityLabel.labelId
            )
            return !existingLabel
          })
      )
      return tx.getRepository(EntityLabel).save(labelsToAdd)
    }

    return queryBuilder.update(LibraryItem).set(values).execute()
  })
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
    async (tx) => tx.withRepository(libraryItemRepository).remove(items),
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
