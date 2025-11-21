import { InputType, Field, Int } from '@nestjs/graphql'
import { IsString, IsOptional, IsInt, Min } from 'class-validator'

/**
 * Input type for updating reading progress with sentinel positions
 */
@InputType()
export class UpdateReadingProgressInput {
  @Field(() => String, {
    description: 'Library item ID',
  })
  @IsString()
  libraryItemId!: string

  @Field(() => String, {
    nullable: true,
    description: 'Hash/version of the content this progress applies to',
  })
  @IsOptional()
  @IsString()
  contentVersion?: string

  @Field(() => Int, {
    description: 'Most recent sentinel the user scrolled past',
  })
  @IsInt()
  @Min(0)
  lastSeenSentinel!: number

  @Field(() => Int, {
    description: 'Highest sentinel ever reached by this user',
  })
  @IsInt()
  @Min(0)
  highestSeenSentinel!: number

  @Field(() => Int, {
    nullable: true,
    description:
      'Total number of sentinels in the article (for progress percentage calculation)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalSentinels?: number
}
