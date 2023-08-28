/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ISearchParserDictionary,
  parse,
  SearchParserKeyWordOffset,
  SearchParserTextOffset,
} from 'search-query-parser'
import { LibraryItemType } from '../entity/library_item'

export enum ReadFilter {
  ALL,
  READ,
  UNREAD,
}

export enum InFilter {
  ALL,
  INBOX,
  ARCHIVE,
  TRASH,
  SUBSCRIPTION,
  LIBRARY,
}

export interface SearchFilter {
  query: string | undefined
  inFilter: InFilter
  readFilter: ReadFilter
  typeFilter?: LibraryItemType
  labelFilters: LabelFilter[]
  sortParams?: SortParams
  hasFilters: HasFilter[]
  dateFilters: DateFilter[]
  termFilters: FieldFilter[]
  matchFilters: FieldFilter[]
  ids: string[]
  recommendedBy?: string
  noFilters: NoFilter[]
  siteName?: string
}

export enum LabelFilterType {
  INCLUDE,
  EXCLUDE,
}

export type LabelFilter = {
  type: LabelFilterType
  labels: string[]
}

export enum HasFilter {
  HIGHLIGHTS,
  LABELS,
}

export interface DateFilter {
  field: string
  startDate?: Date
  endDate?: Date
}

export enum SortBy {
  SAVED = 'saved_at',
  UPDATED = 'updated_at',
  SCORE = '_score',
  PUBLISHED = 'published_at',
  READ = 'read_at',
  LISTENED = 'listened_at',
  WORDS_COUNT = 'word_count',
}

export enum SortOrder {
  ASCENDING = 'ASC',
  DESCENDING = 'DESC',
}

export interface SortParams {
  by: SortBy
  order?: SortOrder
}

export interface FieldFilter {
  nested?: boolean
  field: string
  value: string
}

export interface NoFilter {
  field: string
}

const parseRecommendedBy = (str?: string): string | undefined => {
  if (str === undefined) {
    return undefined
  }

  return str.toLowerCase()
}

const parseIsFilter = (str: string | undefined): ReadFilter => {
  switch (str?.toUpperCase()) {
    case 'READ':
      return ReadFilter.READ
    case 'UNREAD':
      return ReadFilter.UNREAD
  }
  return ReadFilter.ALL
}

const parseInFilter = (
  str: string | undefined,
  query: string | undefined
): InFilter => {
  switch (str?.toUpperCase()) {
    case 'ALL':
      return InFilter.ALL
    case 'INBOX':
      return InFilter.INBOX
    case 'ARCHIVE':
      return InFilter.ARCHIVE
    case 'TRASH':
      return InFilter.TRASH
    case 'SUBSCRIPTION':
      return InFilter.SUBSCRIPTION
    case 'LIBRARY':
      return InFilter.LIBRARY
  }

  return query ? InFilter.ALL : InFilter.INBOX
}

const parseTypeFilter = (
  str: string | undefined
): LibraryItemType | undefined => {
  if (str === undefined) {
    return undefined
  }

  switch (str.toLowerCase()) {
    case 'article':
      return LibraryItemType.Article
    case 'book':
      return LibraryItemType.Book
    case 'pdf':
    case 'file':
      return LibraryItemType.File
    case 'profile':
      return LibraryItemType.Profile
    case 'website':
      return LibraryItemType.Website
    case 'unknown':
      return LibraryItemType.Unknown
  }
  return undefined
}

const parseLabelFilter = (
  str?: string,
  exclude?: ISearchParserDictionary
): LabelFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  const labels = str.split(',')

  // check if the labels are on the exclusion list
  const excluded = exclude?.label && exclude.label.includes(...labels)

  return {
    type: excluded ? LabelFilterType.EXCLUDE : LabelFilterType.INCLUDE,
    // use lower case for label names
    labels: labels.map((label) => label.toLowerCase()),
  }
}

const parseSortParams = (str?: string): SortParams | undefined => {
  if (str === undefined) {
    return undefined
  }

  const [sort, order] = str.split('-')
  const sortOrder =
    order?.toUpperCase() === 'ASC' ? SortOrder.ASCENDING : SortOrder.DESCENDING

  switch (sort.toUpperCase()) {
    case 'UPDATED':
      return {
        by: SortBy.UPDATED,
        order: sortOrder,
      }
    case 'SAVED':
      return {
        by: SortBy.SAVED,
        order: sortOrder,
      }
    case 'SCORE':
      // sort by score does not need an order
      return {
        by: SortBy.SCORE,
      }
    case 'PUBLISHED':
      return {
        by: SortBy.PUBLISHED,
        order: sortOrder,
      }
    case 'READ':
      return {
        by: SortBy.READ,
        order: sortOrder,
      }
    case 'WORDSCOUNT':
      return {
        by: SortBy.WORDS_COUNT,
        order: sortOrder,
      }
  }
}

const parseHasFilter = (str?: string): HasFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  switch (str.toUpperCase()) {
    case 'HIGHLIGHTS':
      return HasFilter.HIGHLIGHTS
    case 'LABELS':
      return HasFilter.LABELS
  }
}

const parseDateFilter = (
  field: string,
  str?: string
): DateFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  const [start, end] = str.split('..')
  const startDate = start && start !== '*' ? new Date(start) : undefined
  const endDate = end && end !== '*' ? new Date(end) : undefined

  switch (field.toUpperCase()) {
    case 'PUBLISHED':
      field = 'publishedAt'
      break
    case 'SAVED':
      field = 'savedAt'
      break
    case 'UPDATED':
      field = 'updatedAt'
  }

  return {
    field,
    startDate,
    endDate,
  }
}

const parseFieldFilter = (
  field: string,
  str?: string
): FieldFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  let nested = false
  // normalize the term to lower case
  const value = str.toLowerCase()

  switch (field.toUpperCase()) {
    case 'RSS':
      field = 'rssFeedUrl'
      break
    case 'NOTE':
      field = 'highlights.annotation'
      nested = true
      break
  }

  return {
    nested,
    field,
    value,
  }
}

const parseIds = (field: string, str?: string): string[] | undefined => {
  if (str === undefined) {
    return undefined
  }

  return str.split(',')
}

const parseNoFilter = (str?: string): NoFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  const strLower = str.toLowerCase()
  const accepted = ['highlight', 'label']
  if (accepted.includes(strLower)) {
    return {
      field: `${strLower}s`,
    }
  }

  return undefined
}

export const parseSearchQuery = (query: string | undefined): SearchFilter => {
  const searchQuery = query ? query.replace(/\W\s":/g, '') : undefined
  const result: SearchFilter = {
    query: searchQuery,
    readFilter: ReadFilter.ALL,
    inFilter: searchQuery ? InFilter.ALL : InFilter.INBOX,
    labelFilters: [],
    hasFilters: [],
    dateFilters: [],
    termFilters: [],
    matchFilters: [],
    ids: [],
    noFilters: [],
  }

  if (!searchQuery) {
    return {
      query: undefined,
      inFilter: InFilter.INBOX,
      readFilter: ReadFilter.ALL,
      labelFilters: [],
      hasFilters: [],
      dateFilters: [],
      termFilters: [],
      matchFilters: [],
      ids: [],
      noFilters: [],
    }
  }

  const parsed = parse(searchQuery, {
    keywords: [
      'in',
      'is',
      'type',
      'label',
      'sort',
      'has',
      'saved',
      'author',
      'published',
      'subscription',
      'language',
      'title',
      'description',
      'content',
      'updated',
      'includes',
      'recommendedBy',
      'no',
      'mode',
      'site',
      'note',
      'rss',
    ],
    tokenize: true,
  })
  if (parsed.offsets) {
    const texts = parsed.offsets
      .filter((offset) => 'text' in offset)
      .map((offset) => offset as SearchParserTextOffset)

    if (texts.length > 0) {
      result.query = texts
        .map((offset: SearchParserTextOffset) => {
          // TODO: the parser library doesn't let us accurately
          // pull out quoted text, so we are just assuming
          // anything with spaces is quoted.
          if (offset.text.indexOf(' ') > -1) {
            return `"${offset.text}"`
          }
          return offset.text
        })
        .join(' ')
    } else {
      result.query = undefined
    }

    const keywords = parsed.offsets
      .filter((offset) => 'keyword' in offset)
      .map((offset) => offset as SearchParserKeyWordOffset)

    for (const keyword of keywords) {
      switch (keyword.keyword) {
        case 'in':
          result.inFilter = parseInFilter(keyword.value, result.query)
          break
        case 'is':
          result.readFilter = parseIsFilter(keyword.value)
          break
        case 'type':
          result.typeFilter = parseTypeFilter(keyword.value)
          break
        case 'label': {
          const labelFilter = parseLabelFilter(keyword.value, parsed.exclude)
          labelFilter && result.labelFilters.push(labelFilter)
          break
        }
        case 'sort':
          result.sortParams = parseSortParams(keyword.value)
          break
        case 'has': {
          const hasFilter = parseHasFilter(keyword.value)
          hasFilter !== undefined && result.hasFilters.push(hasFilter)
          break
        }
        case 'saved':
        case 'read':
        case 'updated':
        case 'published': {
          const dateFilter = parseDateFilter(keyword.keyword, keyword.value)
          dateFilter && result.dateFilters.push(dateFilter)
          break
        }
        // term filters
        case 'subscription':
        case 'rss':
        case 'language': {
          const fieldFilter = parseFieldFilter(keyword.keyword, keyword.value)
          fieldFilter && result.termFilters.push(fieldFilter)
          break
        }
        // match filters
        case 'author':
        case 'title':
        case 'description':
        case 'note':
        case 'content': {
          const fieldFilter = parseFieldFilter(keyword.keyword, keyword.value)
          fieldFilter && result.matchFilters.push(fieldFilter)
          break
        }
        case 'includes': {
          const ids = parseIds(keyword.keyword, keyword.value)
          ids && result.ids.push(...ids)
          break
        }
        case 'recommendedBy': {
          result.recommendedBy = parseRecommendedBy(keyword.value)
          break
        }
        case 'no': {
          const noFilter = parseNoFilter(keyword.value)
          noFilter && result.noFilters.push(noFilter)
          break
        }
        case 'mode':
          // mode is ignored and used only by the frontend
          break
        case 'site':
          result.siteName = keyword.value
          break
      }
    }
  }

  return result
}
