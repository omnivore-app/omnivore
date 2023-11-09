import { Brackets, DeepPartial, SelectQueryBuilder } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { EntityLabel } from '../entity/entity_label'
import { Highlight } from '../entity/highlight'
import { Label } from '../entity/label'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { BulkActionType } from '../generated/graphql'
import { createPubSubClient, EntityType } from '../pubsub'
import { authTrx, getColumns } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { SaveFollowingItemRequest } from '../routers/svc/following'
import { SetClaimsRole } from '../utils/dictionary'
import { wordsCount } from '../utils/helpers'
import {
  DateFilter,
  FieldFilter,
  HasFilter,
  InFilter,
  LabelFilter,
  LabelFilterType,
  NoFilter,
  RangeFilter,
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
  typeFilter?: string
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
  rangeFilters?: RangeFilter[]
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
      .addSelect(
        "ts_rank_cd(library_item.search_tsv, websearch_to_tsquery('english', :query))",
        'rank'
      )
      .andWhere(
        "websearch_to_tsquery('english', :query) @@ library_item.search_tsv"
      )
      .setParameter('query', args.query)
      .orderBy('rank', 'DESC')
  }

  if (args.typeFilter) {
    queryBuilder.andWhere('lower(library_item.item_type) = :typeFilter', {
      typeFilter: args.typeFilter.toLowerCase(),
    })
  }

  if (args.inFilter !== InFilter.ALL) {
    if (args.inFilter === InFilter.FOLLOWING) {
      queryBuilder
        .andWhere('library_item.shared_by IS NOT NULL')
        .andWhere('library_item.hidden_at IS NULL')
    } else {
      queryBuilder.andWhere('library_item.is_in_library = true')

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
            "library_item.deleted_at >= now() - interval '14 days'"
          )
          break
        case InFilter.SUBSCRIPTION:
          queryBuilder
            .andWhere("NOT ('library' ILIKE ANY (library_item.label_names))")
            .andWhere('library_item.archived_at IS NULL')
            .andWhere('library_item.subscription IS NOT NULL')
          break
        case InFilter.LIBRARY:
          queryBuilder
            .andWhere(
              "(library_item.subscription IS NULL OR 'library' ILIKE ANY (library_item.label_names))"
            )
            .andWhere('library_item.archived_at IS NULL')
      }
    }
  }

  if (args.readFilter !== ReadFilter.ALL) {
    switch (args.readFilter) {
      case ReadFilter.READ:
        queryBuilder.andWhere(
          'library_item.reading_progress_bottom_percent > 98'
        )
        break
      case ReadFilter.READING:
        queryBuilder.andWhere(
          'library_item.reading_progress_bottom_percent BETWEEN 2 AND 98'
        )
        break
      case ReadFilter.UNREAD:
        queryBuilder.andWhere(
          'library_item.reading_progress_bottom_percent < 2'
        )
        break
    }
  }

  if (args.hasFilters && args.hasFilters.length > 0) {
    args.hasFilters.forEach((filter) => {
      switch (filter) {
        case HasFilter.HIGHLIGHTS:
          queryBuilder.andWhere("library_item.highlight_annotations <> '{}'")
          break
        case HasFilter.LABELS:
          queryBuilder.andWhere("library_item.label_names <> '{}'")
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
      includeLabels.forEach((includeLabel, i) => {
        const param = `includeLabels_${i}`
        queryBuilder.andWhere(
          `lower(array_cat(library_item.label_names, library_item.highlight_labels)::text)::text[] && ARRAY[:...${param}]::text[]`,
          {
            [param]: includeLabel.labels,
          }
        )
      })
    }

    if (excludeLabels && excludeLabels.length > 0) {
      queryBuilder.andWhere(
        'NOT lower(array_cat(library_item.label_names, library_item.highlight_labels)::text)::text[] && ARRAY[:...excludeLabels]::text[]',
        {
          excludeLabels: excludeLabels.flatMap((filter) => filter.labels),
        }
      )
    }
  }

  if (args.dateFilters && args.dateFilters.length > 0) {
    args.dateFilters.forEach((filter) => {
      const startDate = `${filter.field}_start`
      const endDate = `${filter.field}_end`
      queryBuilder.andWhere(
        `library_item.${filter.field} between :${startDate} and :${endDate}`,
        {
          [startDate]: filter.startDate ?? new Date(0),
          [endDate]: filter.endDate ?? new Date(),
        }
      )
    })
  }

  if (args.termFilters && args.termFilters.length > 0) {
    args.termFilters.forEach((filter) => {
      const param = `term_${filter.field}`
      queryBuilder.andWhere(`lower(library_item.${filter.field}) = :${param}`, {
        [param]: filter.value.toLowerCase(),
      })
    })
  }

  if (args.matchFilters && args.matchFilters.length > 0) {
    args.matchFilters.forEach((filter) => {
      const param = `match_${filter.field}`
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.andWhere(
            `websearch_to_tsquery('english', :${param}) @@ library_item.${filter.field}_tsv`,
            {
              [param]: filter.value,
            }
          ).orWhere(`${filter.field} ILIKE :value`, {
            value: `%${filter.value}%`,
          })
        })
      )
    })
  }

  if (args.ids && args.ids.length > 0) {
    queryBuilder.andWhere('library_item.id = ANY(:ids)', {
      ids: args.ids,
    })
  }

  if (!args.includePending) {
    queryBuilder.andWhere('library_item.state <> :state', {
      state: LibraryItemState.Processing,
    })
  }

  if (!args.includeDeleted && args.inFilter !== InFilter.TRASH) {
    queryBuilder.andWhere('library_item.state <> :state', {
      state: LibraryItemState.Deleted,
    })
  }

  if (args.noFilters) {
    args.noFilters.forEach((filter) => {
      queryBuilder.andWhere(`library_item.${filter.field} = '{}'`)
    })
  }

  if (args.recommendedBy) {
    if (args.recommendedBy === '*') {
      // select all if * is provided
      queryBuilder.andWhere(`library_item.recommender_names <> '{}'`)
    } else {
      // select only if the user is recommended by the provided user
      queryBuilder.andWhere(
        'lower(library_item.recommender_names::text)::text[] && ARRAY[:recommendedBy]::text[]',
        {
          recommendedBy: args.recommendedBy.toLowerCase(),
        }
      )
    }
  }

  if (args.includeContent) {
    queryBuilder.addSelect('library_item.readableContent')
  }

  if (args.rangeFilters && args.rangeFilters.length > 0) {
    args.rangeFilters.forEach((filter, i) => {
      const param = `range_${filter.field}_${i}`
      queryBuilder.andWhere(
        `library_item.${filter.field} ${filter.operator} :${param}`,
        {
          [param]: filter.value,
        }
      )
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

  const selectColumns = getColumns(libraryItemRepository)
    .map((column) => `library_item.${column}`)
    .filter(
      (column) =>
        column !== 'library_item.readableContent' &&
        column !== 'library_item.originalContent'
    )

  // add pagination and sorting
  return authTrx(
    async (tx) => {
      const queryBuilder = tx
        .createQueryBuilder(LibraryItem, 'library_item')
        .select(selectColumns)
        .where('library_item.user_id = :userId', { userId })

      // build the where clause
      buildWhereClause(queryBuilder, args)

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

export const saveFeedItemInFollowing = (input: SaveFollowingItemRequest) => {
  return authTrx(
    async (tx) => {
      const libraryItems: QueryDeepPartialEntity<LibraryItem>[] =
        input.userIds.map((userId) => ({
          ...input,
          user: { id: userId },
          originalUrl: input.url,
          subscription: input.addedToFollowingBy,
          addedToLibraryAt: null,
        }))

      return tx
        .getRepository(LibraryItem)
        .createQueryBuilder()
        .insert()
        .values(libraryItems)
        .orIgnore() // ignore if the item already exists
        .returning('*')
        .execute()
    },
    undefined,
    undefined,
    SetClaimsRole.ADMIN
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
  args: SearchArgs,
  userId: string,
  labels?: Label[]
) => {
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
        deletedAt: new Date(),
        state: LibraryItemState.Deleted,
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
    default:
      throw new Error('Invalid bulk action')
  }

  await authTrx(async (tx) => {
    const queryBuilder = tx
      .createQueryBuilder(LibraryItem, 'library_item')
      .where('library_item.user_id = :userId', { userId })

    // build the where clause
    buildWhereClause(queryBuilder, args)

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
