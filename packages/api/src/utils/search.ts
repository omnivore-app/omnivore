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
import { PageType } from '../generated/graphql'

export enum ReadFilter {
  ALL,
  READ,
  UNREAD,
}

export enum InFilter {
  ALL,
  INBOX,
  ARCHIVE,
}

export interface SearchFilter {
  query: string | undefined
  inFilter: InFilter
  readFilter: ReadFilter
  typeFilter?: PageType
  labelFilters: LabelFilter[]
  sortParams?: SortParams
  hasFilters: HasFilter[]
  dateFilters: DateFilter[]
  termFilters: FieldFilter[]
  matchFilters: FieldFilter[]
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
  SHARED_AT,
}

export interface DateFilter {
  field: string
  startDate?: Date
  endDate?: Date
}

export enum SortBy {
  SAVED = 'savedAt',
  UPDATED = 'updatedAt',
  SCORE = '_score',
  PUBLISHED = 'publishedAt',
  READ = 'readAt',
  LISTENED = 'listenedAt',
}

export enum SortOrder {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export interface SortParams {
  by: SortBy
  order?: SortOrder
}

export interface FieldFilter {
  field: string
  value: string
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
  }
  return query ? InFilter.ALL : InFilter.INBOX
}

const parseTypeFilter = (str: string | undefined): PageType | undefined => {
  if (str === undefined) {
    return undefined
  }

  switch (str.toLowerCase()) {
    case 'article':
      return PageType.Article
    case 'book':
      return PageType.Book
    case 'pdf':
    case 'file':
      return PageType.File
    case 'profile':
      return PageType.Profile
    case 'website':
      return PageType.Website
    case 'unknown':
      return PageType.Unknown
    case 'highlights':
      return PageType.Highlights
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
  }
}

const parseHasFilter = (str?: string): HasFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  switch (str.toUpperCase()) {
    case 'HIGHLIGHTS':
      return HasFilter.HIGHLIGHTS
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

  return {
    field,
    // normalize the term to lower case
    value: str.toLowerCase(),
  }
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
      'published',
      'subscription',
      'language',
      'title',
      'description',
      'content',
      'updated',
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
        case 'language': {
          const fieldFilter = parseFieldFilter(keyword.keyword, keyword.value)
          fieldFilter && result.termFilters.push(fieldFilter)
          break
        }
        // match filters
        case 'title':
        case 'description':
        case 'content': {
          const fieldFilter = parseFieldFilter(keyword.keyword, keyword.value)
          fieldFilter && result.matchFilters.push(fieldFilter)
          break
        }
      }
    }
  }

  return result
}
