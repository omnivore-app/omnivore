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
import { InputMaybe, PageType, SortParams } from '../generated/graphql'

export enum ReadFilter {
  ALL,
  READ,
  READING,
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
  typeFilter?: string
  labelFilters: LabelFilter[]
  sort?: Sort
  hasFilters: HasFilter[]
  dateFilters: DateFilter[]
  termFilters: FieldFilter[]
  matchFilters: FieldFilter[]
  ids: string[]
  recommendedBy?: string
  noFilters: NoFilter[]
  rangeFilters: RangeFilter[]
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

export interface RangeFilter {
  field: string
  operator: string
  value: number
}

export enum SortBy {
  SAVED = 'savedAt',
  UPDATED = 'updatedAt',
  PUBLISHED = 'publishedAt',
  READ = 'readAt',
  WORDS_COUNT = 'wordCount',
}

export enum SortOrder {
  ASCENDING = 'ASC',
  DESCENDING = 'DESC',
}

export interface Sort {
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

const parseStringValue = (str?: string): string | undefined => {
  if (str === undefined) {
    return undefined
  }

  return str.toLowerCase()
}

const parseIsFilter = (str: string | undefined): ReadFilter => {
  switch (str?.toUpperCase()) {
    case 'READ':
      return ReadFilter.READ
    case 'READING':
      return ReadFilter.READING
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

const parseTypeFilter = (str: string | undefined): string | undefined => {
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

const parseSort = (str?: string): Sort | undefined => {
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

const parseRangeFilter = (
  field: string,
  str?: string
): RangeFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  switch (field.toUpperCase()) {
    case 'WORDSCOUNT':
      field = 'word_count'
      break
    case 'READPOSITION':
      field = 'reading_progress_bottom_percent'
      break
    default:
      return undefined
  }

  const operatorRegex = /([<>]=?)/
  const operator = str.match(operatorRegex)?.[0]
  if (!operator) {
    return undefined
  }

  const value = str.replace(operatorRegex, '')
  if (!value) {
    return undefined
  }

  return {
    field,
    operator,
    value: Number(value),
  }
}

const parseFieldFilter = (
  field: string,
  str?: string
): FieldFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  // normalize the term to lower case
  const value = str.toLowerCase()

  switch (field.toUpperCase()) {
    case 'LANGUAGE':
      return {
        field: 'item_language',
        value,
      }
    case 'SUBSCRIPTION':
    case 'RSS':
      return {
        field: 'subscription',
        value,
      }
    case 'SITE':
      return {
        field: 'site_name',
        value,
      }
  }

  return {
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
  switch (strLower) {
    case 'highlight':
      return { field: 'highlight_annotations' }
    case 'label':
      return { field: 'label_names' }
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
    rangeFilters: [],
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
      rangeFilters: [],
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
      'wordsCount',
      'readPosition',
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
          result.sort = parseSort(keyword.value)
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
        case 'site':
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
          result.recommendedBy = parseStringValue(keyword.value)
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
        case 'readPosition':
        case 'wordsCount': {
          const rangeFilter = parseRangeFilter(keyword.keyword, keyword.value)
          rangeFilter && result.rangeFilters.push(rangeFilter)
          break
        }
      }
    }
  }

  return result
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
