import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { LibraryItemState, ContentReaderType } from '../entities/library-item.entity'
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

  @Field(() => Float, { nullable: true })
  readingProgressTopPercent?: number | null

  @Field(() => Float, { nullable: true })
  readingProgressBottomPercent?: number | null

  @Field(() => LibraryItemState)
  state!: LibraryItemState

  @Field(() => ContentReaderType)
  contentReader!: ContentReaderType

  @Field()
  folder!: string

  @Field(() => [Label], { nullable: true })
  labels?: Label[] | null
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
