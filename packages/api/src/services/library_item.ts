import { DeepPartial, SelectQueryBuilder } from 'typeorm'
import { Highlight } from '../entity/highlight'
import { Label } from '../entity/label'
import {
  LibraryItem,
  LibraryItemState,
  LibraryItemType,
} from '../entity/library_item'
import { entityManager } from '../repository'
import { wordsCount } from '../utils/helpers'
import { logger } from '../utils/logger'
import {
  DateFilter,
  FieldFilter,
  HasFilter,
  InFilter,
  LabelFilter,
  LabelFilterType,
  NoFilter,
  ReadFilter,
  SortBy,
  SortOrder,
  SortParams,
} from '../utils/search'

const MAX_CONTENT_LENGTH = 10 * 1024 * 1024 // 10MB for readable content
const CONTENT_LENGTH_ERROR = 'Your page content is too large to be saved.'

export interface PageSearchArgs {
  from?: number
  size?: number
  sort?: SortParams
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

export interface SearchItem {
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

export const createLibraryItem = async (
  libraryItem: DeepPartial<LibraryItem>,
  em = entityManager
): Promise<LibraryItem> => {
  if (
    libraryItem.readableContent &&
    libraryItem.readableContent.length > MAX_CONTENT_LENGTH
  ) {
    logger.info('page content is too large', {
      url: libraryItem.originalUrl,
      contentLength: libraryItem.readableContent.length,
    })

    libraryItem.readableContent = CONTENT_LENGTH_ERROR
  }

  return em.getRepository(LibraryItem).save({
    ...libraryItem,
    savedAt: libraryItem.savedAt || new Date(),
    wordCount:
      libraryItem.wordCount ?? wordsCount(libraryItem.readableContent ?? ''),
  })
}

const buildWhereClause = (
  queryBuilder: SelectQueryBuilder<LibraryItem>,
  userId: string,
  args: PageSearchArgs
) => {
  if (args.query) {
    queryBuilder.andWhere(`tsv @@ websearch_to_tsquery(:query)`, {
      query: args.query,
    })
  }

  if (args.typeFilter) {
    queryBuilder.andWhere(`library_item.item_type = :typeFilter`, {
      typeFilter: args.typeFilter,
    })
  }

  if (args.inFilter !== InFilter.ALL) {
    switch (args.inFilter) {
      case InFilter.INBOX:
        queryBuilder.andWhere(`library_item.archived_at IS NULL`)
        break
      case InFilter.ARCHIVE:
        queryBuilder.andWhere(`library_item.archived_at IS NOT NULL`)
        break
      case InFilter.TRASH:
        // return only deleted pages within 14 days
        queryBuilder.andWhere(
          `library_item.state = :state AND deleted_at >= now() - interval '14 days'`,
          {
            state: LibraryItemState.Deleted,
          }
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
          queryBuilder.andWhere(`library_item.highlights IS NOT NULL`)
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
      queryBuilder.andWhere(
        `library_item.id IN (SELECT library_item_id FROM library_item_label WHERE name IN (:...includeLabels))`,
        {
          includeLabels,
        }
      )
    }

    if (excludeLabels && excludeLabels.length > 0) {
      queryBuilder.andWhere(
        `library_item.id NOT IN (SELECT library_item_id FROM library_item_label WHERE name IN (:...excludeLabels))`,
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
}

export const searchLibraryItems = async (
  args: PageSearchArgs,
  userId: string
): Promise<[LibraryItem[], number] | null> => {
  const { from = 0, size = 10, sort } = args

  // default order is descending
  const sortOrder = sort?.order || SortOrder.DESCENDING
  // default sort by saved_at
  const sortField = sort?.by || SortBy.SAVED

  const queryBuilder = entityManager
    .createQueryBuilder(LibraryItem, 'library_item')
    .select('library_item.*')
    .where('library_item.user_id = :userId', { userId })

  // build the where clause
  buildWhereClause(queryBuilder, userId, args)

  // add pagination and sorting
  const libraryItems = await queryBuilder
    .orderBy(`omnivore.library_item.${sortField}`, sortOrder)
    .offset(from)
    .limit(size)
    .getMany()

  const count = await queryBuilder.getCount()

  return [libraryItems, count]
}
