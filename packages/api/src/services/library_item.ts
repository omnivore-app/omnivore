import { DeepPartial, SelectQueryBuilder } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { Highlight } from '../entity/highlight'
import { Label } from '../entity/label'
import {
  LibraryItem,
  LibraryItemState,
  LibraryItemType,
} from '../entity/library_item'
import { BulkActionType } from '../generated/graphql'
import { createPubSubClient, EntityType } from '../pubsub'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import {
  DateFilter,
  FieldFilter,
  HasFilter,
  InFilter,
  LabelFilter,
  LabelFilterType,
  NoFilter,
  ReadFilter,
  Sort,
  SortBy,
  SortOrder,
} from '../utils/search'

export interface SearchArgs {
  from?: number
  size?: number
  sort?: Sort
  query?: string
  inFilter?: InFilter
  readFilter?: ReadFilter
  typeFilter?: LibraryItemType
  labelFilters?: LabelFilter[]
  hasFilters?: HasFilter[]
  dateFilters?: DateFilter[]
  termFilters?: FieldFilter[]
  matchFilters?: FieldFilter[]
  includePending?: boolean | null
  includeDeleted?: boolean
  ids?: string[]
  recommendedBy?: string
  includeContent?: boolean
  noFilters?: NoFilter[]
  siteName?: string
}

export interface SearchResultItem {
  annotation?: string | null
  author?: string | null
  createdAt: Date
  description?: string | null
  id: string
  image?: string | null
  pageId?: string
  pageType: LibraryItemType
  publishedAt?: Date
  quote?: string | null
  shortId?: string | null
  slug: string
  title: string
  uploadFileId?: string | null
  url: string
  archivedAt?: Date | null
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

const buildWhereClause = (
  queryBuilder: SelectQueryBuilder<LibraryItem>,
  args: SearchArgs
) => {
  if (args.query) {
    queryBuilder
      .addSelect('ts_rank_cd(library_item.search_tsv, query)', 'rank')
      .addFrom("websearch_to_tsquery('english', ':query')", 'query')
      .andWhere('query @@ library_item.search_tsv')
      .setParameter('query', args.query)
  }

  if (args.typeFilter) {
    queryBuilder.andWhere('library_item.item_type = :typeFilter', {
      typeFilter: args.typeFilter,
    })
  }

  if (args.inFilter !== InFilter.ALL) {
    switch (args.inFilter) {
      case InFilter.INBOX:
        queryBuilder.andWhere('library_item.archived_at IS NULL')
        break
      case InFilter.ARCHIVE:
        queryBuilder.andWhere('library_item.archived_at IS NOT NULL')
        break
      case InFilter.TRASH:
        // return only deleted pages within 14 days
        queryBuilder.andWhere(
          "library_item.state = 'DELETED' AND library_item.deleted_at >= now() - interval '14 days'"
        )
        break
    }
  }

  if (args.readFilter !== ReadFilter.ALL) {
    switch (args.readFilter) {
      case ReadFilter.READ:
        queryBuilder.andWhere('library_item.reading_progress_top_percent >= 98')
        break
      case ReadFilter.UNREAD:
        queryBuilder.andWhere('library_item.reading_progress_top_percent < 98')
        break
    }
  }

  if (args.hasFilters && args.hasFilters.length > 0) {
    args.hasFilters.forEach((filter) => {
      switch (filter) {
        case HasFilter.HIGHLIGHTS:
          queryBuilder.andWhere(
            'library_item.highlight_annotations IS NOT NULL'
          )
          break
        case HasFilter.LABELS:
          queryBuilder.andWhere('library_item.label_names IS NOT NULL')
          break
      }
    })
  }

  if (args.labelFilters && args.labelFilters.length > 0) {
    const includeLabels = args.labelFilters?.filter(
      (filter) => filter.type === LabelFilterType.INCLUDE
    )
    const excludeLabels = args.labelFilters?.filter(
      (filter) => filter.type === LabelFilterType.EXCLUDE
    )

    if (includeLabels && includeLabels.length > 0) {
      includeLabels.forEach((includeLabel) => {
        queryBuilder.andWhere(
          'library_item.label_names @> ARRAY[:...includeLabels]::text[] OR library_item.highlight_labels @> ARRAY[:...includeLabels]::text[]',
          {
            includeLabels: includeLabel.labels,
          }
        )
      })
    }

    if (excludeLabels && excludeLabels.length > 0) {
      queryBuilder.andWhere(
        'NOT library_item.label_names && ARRAY[:...excludeLabels]::text[] AND NOT library_item.highlight_labels && ARRAY[:...excludeLabels]::text[]',
        {
          excludeLabels,
        }
      )
    }
  }

  if (args.dateFilters && args.dateFilters.length > 0) {
    args.dateFilters.forEach((filter) => {
      queryBuilder.andWhere(
        `library_item.${filter.field} between :startDate and :endDate`,
        {
          startDate: filter.startDate ?? new Date(0),
          endDate: filter.endDate ?? new Date(),
        }
      )
    })
  }

  if (args.termFilters && args.termFilters.length > 0) {
    args.termFilters.forEach((filter) => {
      queryBuilder.andWhere(`library_item.${filter.field} = :value`, {
        value: filter.value,
      })
    })
  }

  if (args.matchFilters && args.matchFilters.length > 0) {
    args.matchFilters.forEach((filter) => {
      queryBuilder.andWhere(
        `websearch_to_tsquery('english', ':query') @@ library_item.${filter.field}_tsv`,
        {
          query: filter.value,
        }
      )
    })
  }

  if (args.ids && args.ids.length > 0) {
    queryBuilder.andWhere('library_item.id IN (:...ids)', { ids: args.ids })
  }

  if (!args.includePending) {
    queryBuilder.andWhere('library_item.state != :state', {
      state: LibraryItemState.Processing,
    })
  }

  if (!args.includeDeleted && args.inFilter !== InFilter.TRASH) {
    queryBuilder.andWhere('library_item.state != :state', {
      state: LibraryItemState.Deleted,
    })
  }

  if (args.noFilters) {
    args.noFilters.forEach((filter) => {
      queryBuilder.andWhere(`library_item.${filter.field} IS NULL`)
    })
  }
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

  // add pagination and sorting
  return authTrx(async (tx) => {
    const queryBuilder = tx
      .createQueryBuilder(LibraryItem, 'library_item')
      .leftJoinAndSelect('library_item.labels', 'labels')
      .leftJoinAndSelect('library_item.highlights', 'highlights')
      .leftJoinAndSelect('highlights.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('library_item.user_id = :userId', { userId })

    // build the where clause
    buildWhereClause(queryBuilder, args)

    const libraryItems = await queryBuilder
      .orderBy(`library_item.${sortField}`, sortOrder)
      .offset(from)
      .limit(size)
      .getMany()

    const count = await queryBuilder.getCount()

    return { libraryItems, count }
  })
}

export const findLibraryItemById = async (
  id: string,
  userId: string
): Promise<LibraryItem | null> => {
  return authTrx(async (tx) =>
    tx
      .createQueryBuilder(LibraryItem, 'library_item')
      .leftJoinAndSelect('library_item.labels', 'labels')
      .leftJoinAndSelect('library_item.highlights', 'highlights')
      .where('library_item.user_id = :userId', { userId })
      .andWhere('library_item.id = :id', { id })
      .getOne()
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
        .where('library_item.user_id = :userId', { userId })
        .andWhere('library_item.original_url = :url', { url })
        .getOne(),
    undefined,
    userId
  )
}

export const refreshLibraryItem = async (
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
    },
    userId,
    pubsub
  )
}

export const updateLibraryItem = async (
  id: string,
  libraryItem: DeepPartial<LibraryItem>,
  userId: string,
  pubsub = createPubSubClient()
): Promise<LibraryItem> => {
  const updatedLibraryItem = await authTrx(async (tx) => {
    const itemRepo = tx.withRepository(libraryItemRepository)
    await itemRepo.save({ id, ...libraryItem })

    return itemRepo.findOneByOrFail({ id })
  })

  await pubsub.entityUpdated<DeepPartial<LibraryItem>>(
    EntityType.PAGE,
    libraryItem,
    userId
  )

  return updatedLibraryItem
}

export const createLibraryItem = async (
  libraryItem: DeepPartial<LibraryItem>,
  userId: string,
  pubsub = createPubSubClient()
): Promise<LibraryItem> => {
  const newLibraryItem = await authTrx(
    async (tx) => tx.withRepository(libraryItemRepository).save(libraryItem),
    undefined,
    userId
  )

  await pubsub.entityCreated<LibraryItem>(
    EntityType.PAGE,
    newLibraryItem,
    userId
  )

  return newLibraryItem
}

export const findLibraryItemsByPrefix = async (
  prefix: string,
  limit = 5
): Promise<LibraryItem[]> => {
  return authTrx(async (tx) =>
    tx
      .createQueryBuilder(LibraryItem, 'library_item')
      .where('library_item.title ILIKE :prefix', { prefix: `${prefix}%` })
      .orWhere('library_item.site_name ILIKE :prefix', { prefix: `${prefix}%` })
      .limit(limit)
      .getMany()
  )
}

export const countByCreatedAt = async (
  startDate = new Date(0),
  endDate = new Date()
): Promise<number> => {
  return authTrx(async (tx) =>
    tx
      .createQueryBuilder(LibraryItem, 'library_item')
      .where('library_item.created_at between :startDate and :endDate', {
        startDate,
        endDate,
      })
      .getCount()
  )
}

export const updateLibraryItems = async (
  action: BulkActionType,
  args: SearchArgs,
  labels?: Label[]
) => {
  // build the script
  let values: QueryDeepPartialEntity<LibraryItem> = {}
  switch (action) {
    case BulkActionType.Archive:
      values = {
        archivedAt: new Date(),
      }
      break
    case BulkActionType.Delete:
      values = {
        state: LibraryItemState.Deleted,
      }
      break
    case BulkActionType.AddLabels:
      values = {
        labels,
      }
      break
    case BulkActionType.MarkAsRead:
      values = {
        readAt: new Date(),
        readingProgressTopPercent: 100,
        readingProgressBottomPercent: 100,
      }
      break
    default:
      throw new Error('Invalid bulk action')
  }

  await authTrx(async (tx) => {
    const queryBuilder = tx.createQueryBuilder(LibraryItem, 'library_item')

    // build the where clause
    buildWhereClause(queryBuilder, args)

    return queryBuilder.update(LibraryItem).set(values).execute()
  })
}
