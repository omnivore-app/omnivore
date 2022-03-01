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

export type SearchFilter = {
  query: string | undefined
  inFilter: InFilter
  readFilter: ReadFilter
  typeFilter?: PageType | undefined
  labelFilters: LabelFilter[]
}

export enum LabelFilterType {
  ANY,
  NONE,
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
  str?: string,
  exclude?: ISearchParserDictionary
): LabelFilter | undefined => {
  if (str === undefined) {
    return undefined
  }

  // use lower case for label names
  const labels = str.toLocaleLowerCase().split(',')

  // check if the labels are in the exclude list
  const excluded =
    exclude &&
    exclude.label &&
    labels.every((label) => exclude.label.includes(label))

  return {
    type: excluded ? LabelFilterType.NONE : LabelFilterType.ANY,
    labels,
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
    keywords: ['in', 'is', 'type', 'label'],
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
      }
    }
  }

  return result
}
