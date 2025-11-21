import { Field, ObjectType, ID, Int } from '@nestjs/graphql'

/**
 * GraphQL type for ReadingProgress
 * Represents sentinel-based reading position for a user/item/version
 */
@ObjectType()
export class ReadingProgress {
  @Field(() => ID, {
    description: 'Unique identifier',
  })
  id!: string

  @Field(() => String, {
    description: 'Library item this progress belongs to',
  })
  libraryItemId!: string

  @Field(() => String, {
    nullable: true,
    description: 'Hash/version of the content this progress applies to',
  })
  contentVersion?: string | null

  @Field(() => Int, {
    description:
      'Most recent sentinel scrolled past (for position restoration)',
  })
  lastSeenSentinel!: number

  @Field(() => Int, {
    description: 'Highest sentinel ever reached (for completion tracking)',
  })
  highestSeenSentinel!: number

  @Field(() => Date, {
    description: 'When this progress record was first created',
  })
  createdAt!: Date

  @Field(() => Date, {
    description: 'When this progress was last updated',
  })
  updatedAt!: Date
}
