/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  parse,
  SearchParserKeyWordOffset,
  SearchParserTextOffset,
} from 'search-query-parser'
import { PageType, SortBy, SortOrder, SortParams } from '../generated/graphql'

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

export type SearchFilter = {
  query: string | undefined
  inFilter: InFilter
  readFilter: ReadFilter
  typeFilter?: PageType | undefined
  labelFilters: LabelFilter[]
  sortParams?: SortParams
}

export enum LabelFilterType {
  INCLUDE,
  EXCLUDE,
}

export type LabelFilter = {
  type: LabelFilterType
  labels: string[]
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

  switch (str) {
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
  excludedLabels: string[],
  str?: string
): LabelFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  // use lower case for label names
  const labels = str.toLowerCase().split(',')

  // check if all the labels are on the exclusion list
  const excluded = labels.every((label) => excludedLabels.includes(label))

  return {
    type: excluded ? LabelFilterType.EXCLUDE : LabelFilterType.INCLUDE,
    labels: labels,
  }
}

const parseSortParams = (str?: string): SortParams | undefined => {
  if (str === undefined) {
    return undefined
  }

  const [sort, order] = str.split(':')
  const sortOrder =
    order?.toUpperCase() === 'ASC' ? SortOrder.Ascending : SortOrder.Descending

  switch (sort.toUpperCase()) {
    case 'UPDATED_TIME':
    case 'SAVED_AT':
      return {
        by: SortBy.SavedAt,
        order: sortOrder,
      }
    case 'SCORE':
      // sort by score does not need an order
      return {
        by: SortBy.Score,
      }
  }
}

export const parseSearchQuery = (query: string | undefined): SearchFilter => {
  const searchQuery = query ? query.replace(/\W\s":/g, '') : undefined
  const result: SearchFilter = {
    query: searchQuery,
    readFilter: ReadFilter.ALL,
    inFilter: searchQuery ? InFilter.ALL : InFilter.INBOX,
    labelFilters: [],
  }

  if (!searchQuery) {
    return {
      query: undefined,
      inFilter: InFilter.INBOX,
      readFilter: ReadFilter.ALL,
      labelFilters: [],
    }
  }

  const parsed = parse(searchQuery, {
    keywords: ['in', 'is', 'type', 'label', 'sort'],
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

    // lowercase the excluded labels
    const excludedLabels: string[] = parsed.exclude?.label
      ? parsed.exclude.label.map((label: string) => label.toLowerCase())
      : []

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
          const labelFilter = parseLabelFilter(excludedLabels, keyword.value)
          labelFilter && result.labelFilters.push(labelFilter)
          break
        }
        case 'sort': {
          result.sortParams = parseSortParams(keyword.value)
          break
        }
      }
    }
  }

  return result
}
