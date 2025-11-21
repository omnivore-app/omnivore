import {
  Field,
  Float,
  ID,
  Int,
  ObjectType,
  registerEnumType,
  createUnionType,
} from '@nestjs/graphql'
import {
  LibraryItemState,
  ContentReaderType,
} from '../entities/library-item.entity'
import { Label } from '../../label/dto/label.type'

registerEnumType(LibraryItemState, {
  name: 'LibraryItemState',
})

registerEnumType(ContentReaderType, {
  name: 'ContentReaderType',
})

@ObjectType()
export class LibraryItem {
  @Field(() => ID)
  id!: string

  @Field()
  title!: string

  @Field()
  slug!: string

  @Field()
  originalUrl!: string

  @Field({ nullable: true })
  author?: string | null

  @Field({ nullable: true })
  description?: string | null

  @Field(() => Date)
  savedAt!: Date

  @Field(() => Date)
  createdAt!: Date

  @Field(() => Date, { nullable: true })
  publishedAt?: Date | null

  @Field(() => Date, { nullable: true })
  readAt?: Date | null

  @Field(() => Date)
  updatedAt!: Date

  @Field(() => LibraryItemState)
  state!: LibraryItemState

  @Field(() => ContentReaderType)
  contentReader!: ContentReaderType

  @Field()
  folder!: string

  @Field(() => [Label], { nullable: true })
  labels?: Label[] | null

  @Field({ nullable: true })
  content?: string | null

  @Field({ nullable: true })
  note?: string | null

  @Field(() => Date, { nullable: true })
  noteUpdatedAt?: Date | null

  @Field({
    nullable: true,
    description: 'Thumbnail/cover image URL for the library item',
  })
  thumbnail?: string | null

  @Field(() => Float, {
    nullable: true,
    description: 'Estimated word count for reading time calculation',
  })
  wordCount?: number | null

  @Field({
    nullable: true,
    description: 'Site name (e.g., "Medium", "New York Times")',
  })
  siteName?: string | null

  @Field({ nullable: true, description: 'Site favicon/icon URL' })
  siteIcon?: string | null

  @Field({
    description: 'Item type (ARTICLE, FILE, VIDEO, etc.)',
    defaultValue: 'ARTICLE',
  })
  itemType!: string

  // Legacy field aliases for backward compatibility with frontend
  @Field({
    nullable: true,
    name: 'image',
    description: 'Legacy alias for thumbnail',
  })
  get image(): string | null {
    return this.thumbnail
  }

  @Field(() => Float, {
    nullable: true,
    name: 'wordsCount',
    description: 'Legacy alias for wordCount',
  })
  get wordsCount(): number | null {
    return this.wordCount
  }

  @Field({ name: 'pageType', description: 'Legacy alias for itemType' })
  get pageType(): string {
    return this.itemType
  }

  @Field(() => Float, {
    nullable: true,
    description: 'Reading progress percentage (0-100) based on sentinel tracking',
  })
  readingProgressPercent?: number | null
}

@ObjectType()
export class LibraryItemsConnection {
  @Field(() => [LibraryItem])
  items!: LibraryItem[]

  @Field({ nullable: true })
  nextCursor?: string | null
}

@ObjectType()
export class BulkActionResult {
  @Field()
  success!: boolean

  @Field()
  successCount!: number

  @Field()
  failureCount!: number

  @Field(() => [String], { nullable: true })
  errors?: string[] | null

  @Field({ nullable: true })
  message?: string | null
}

// Legacy search result types for backward compatibility
@ObjectType()
export class SearchItemEdge {
  @Field()
  cursor!: string

  @Field(() => LibraryItem)
  node!: LibraryItem
}

@ObjectType()
export class SearchPageInfo {
  @Field()
  hasNextPage!: boolean

  @Field()
  hasPreviousPage!: boolean

  @Field({ nullable: true })
  startCursor?: string | null

  @Field({ nullable: true })
  endCursor?: string | null

  @Field(() => Int, { nullable: true })
  totalCount?: number | null
}

@ObjectType()
export class SearchSuccess {
  @Field(() => [SearchItemEdge])
  edges!: SearchItemEdge[]

  @Field(() => SearchPageInfo)
  pageInfo!: SearchPageInfo
}

@ObjectType()
export class SearchError {
  @Field(() => [String])
  errorCodes!: string[]
}

// Union type for search result (legacy compatibility)
export const SearchResult = createUnionType({
  name: 'SearchResult',
  types: () => [SearchSuccess, SearchError] as const,
  resolveType(value) {
    if ('edges' in value) {
      return SearchSuccess
    }
    if ('errorCodes' in value) {
      return SearchError
    }
    return null
  },
})
