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
import { FOLDERS, ALL_FOLDERS } from '../../constants/folders.constants'

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
  @IsIn([...ALL_FOLDERS])
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
  @IsIn([...ALL_FOLDERS])
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
    defaultValue: FOLDERS.INBOX,
    description: 'Folder to save the URL to (inbox, archive)',
  })
  @IsOptional()
  @IsString()
  @IsIn([FOLDERS.INBOX, FOLDERS.ARCHIVE])
  folder?: string

  @Field(() => String, {
    nullable: true,
    defaultValue: 'web',
    description: 'Source of the save request (web, mobile, api, extension)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['web', 'mobile', 'api', 'extension'])
  source?: 'web' | 'mobile' | 'api' | 'extension'
}

/**
 * Input type for updating notebook content
 */
@InputType()
export class UpdateNotebookInput {
  @Field(() => String, { description: 'Notebook content (supports markdown)' })
  @IsString()
  note: string
}

/**
 * Input type for updating library item metadata (title, author, description)
 */
@InputType()
export class UpdateLibraryItemInput {
  @Field(() => String, {
    nullable: true,
    description: 'Updated title for the library item',
  })
  @IsOptional()
  @IsString()
  title?: string

  @Field(() => String, {
    nullable: true,
    description: 'Updated author name for the library item',
  })
  @IsOptional()
  @IsString()
  author?: string

  @Field(() => String, {
    nullable: true,
    description: 'Updated description for the library item',
  })
  @IsOptional()
  @IsString()
  description?: string

  @Field(() => Date, {
    nullable: true,
    description: 'Read timestamp (set to mark as read, null to mark as unread)',
  })
  @IsOptional()
  readAt?: Date | null
}
