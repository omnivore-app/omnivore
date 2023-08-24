import { DeepPartial } from 'typeorm'
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
  NoFilter,
  ReadFilter,
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
