import {
  InputType,
  Field,
  Int,
  Float,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql'
import {
  IsNumber,
  Min,
  Max,
  IsInt,
  IsString,
  IsIn,
  IsOptional,
  IsEnum,
  IsUrl,
} from 'class-validator'
import { LibraryItemState } from '../entities/library-item.entity'

/**
 * Sort field options for library items
 */
export enum LibrarySortField {
  SAVED_AT = 'savedAt',
  UPDATED_AT = 'updatedAt',
  PUBLISHED_AT = 'publishedAt',
  TITLE = 'title',
  AUTHOR = 'author',
}

registerEnumType(LibrarySortField, {
  name: 'LibrarySortField',
  description: 'Available fields to sort library items by',
})

/**
 * Sort order options
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'Sort order direction',
})

/**
 * Input type for updating reading progress
 */
@InputType()
export class ReadingProgressInput {
  @Field(() => Float, { description: 'Top reading progress percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  readingProgressTopPercent: number

  @Field(() => Float, {
    description: 'Bottom reading progress percentage (0-100)',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  readingProgressBottomPercent: number

  @Field(() => Int, {
    description: 'Anchor index for last read position',
    nullable: true,
    defaultValue: 0,
  })
  @IsInt()
  @Min(0)
  readingProgressAnchorIndex?: number

  @Field(() => Int, {
    description: 'Highest read anchor index',
    nullable: true,
    defaultValue: 0,
  })
  @IsInt()
  @Min(0)
  readingProgressHighestAnchor?: number
}

/**
 * Result type for delete operations
 */
@ObjectType()
export class DeleteResult {
  @Field(() => Boolean, { description: 'Whether the deletion was successful' })
  success: boolean

  @Field(() => String, {
    description: 'Optional message providing details about the operation',
    nullable: true,
  })
  message?: string

  @Field(() => String, {
    description: 'ID of the deleted item',
    nullable: true,
  })
  itemId?: string
}

/**
 * Input type for moving items to different folders
 */
@InputType()
export class MoveToFolderInput {
  @Field(() => String, { description: 'Target folder (inbox, archive, trash)' })
  @IsString()
  @IsIn(['inbox', 'archive', 'trash', 'all'])
  folder: string
}

/**
 * Input type for searching and filtering library items
 */
@InputType()
export class LibrarySearchInput {
  @Field(() => String, {
    nullable: true,
    description:
      'Search query for full-text search across title, description, author, and content',
  })
  @IsOptional()
  @IsString()
  query?: string

  @Field(() => String, {
    nullable: true,
    description: 'Filter by folder (inbox, archive, trash, all)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['inbox', 'archive', 'trash', 'all'])
  folder?: string

  @Field(() => LibraryItemState, {
    nullable: true,
    description: 'Filter by item state',
  })
  @IsOptional()
  @IsEnum(LibraryItemState)
  state?: LibraryItemState

  @Field(() => LibrarySortField, {
    nullable: true,
    defaultValue: LibrarySortField.SAVED_AT,
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsEnum(LibrarySortField)
  sortBy?: LibrarySortField

  @Field(() => SortOrder, {
    nullable: true,
    defaultValue: SortOrder.DESC,
    description: 'Sort order (ASC or DESC)',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder

  @Field(() => [String], {
    nullable: true,
    description: 'Filter by label names (items with ANY of these labels)',
  })
  @IsOptional()
  labels?: string[]
}

/**
 * Input type for saving a URL to the library
 */
@InputType()
export class SaveUrlInput {
  @Field(() => String, { description: 'URL to save to library' })
  @IsUrl({}, { message: 'Must be a valid URL' })
  @IsString()
  url: string

  @Field(() => String, {
    nullable: true,
    defaultValue: 'inbox',
    description: 'Folder to save the URL to (inbox, archive)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['inbox', 'archive'])
  folder?: string
}
