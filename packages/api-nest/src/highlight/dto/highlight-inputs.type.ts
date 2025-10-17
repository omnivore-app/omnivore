import { InputType, Field, Float, Int } from '@nestjs/graphql'
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsIn,
} from 'class-validator'

/**
 * Input type for creating a new highlight
 */
@InputType()
export class CreateHighlightInput {
  @Field(() => String, { description: 'Library item ID' })
  @IsString()
  libraryItemId!: string

  @Field(() => String, { description: 'Quoted text from the document' })
  @IsString()
  quote!: string

  @Field(() => String, {
    nullable: true,
    description: 'Text before the quote (for context)',
  })
  @IsOptional()
  @IsString()
  prefix?: string

  @Field(() => String, {
    nullable: true,
    description: 'Text after the quote (for context)',
  })
  @IsOptional()
  @IsString()
  suffix?: string

  @Field(() => String, {
    nullable: true,
    description: 'User annotation/note on the highlight',
  })
  @IsOptional()
  @IsString()
  annotation?: string

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: 'Position in document as percentage (0-100)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  highlightPositionPercent?: number

  @Field(() => Int, {
    nullable: true,
    defaultValue: 0,
    description: 'Anchor index for position',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  highlightPositionAnchorIndex?: number

  @Field(() => String, {
    nullable: true,
    description: 'Highlight color (yellow, red, green, blue)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['yellow', 'red', 'green', 'blue'])
  color?: string

  @Field(() => String, {
    nullable: true,
    description: 'HTML content of the highlight',
  })
  @IsOptional()
  @IsString()
  html?: string
}

/**
 * Input type for updating an existing highlight
 */
@InputType()
export class UpdateHighlightInput {
  @Field(() => String, {
    nullable: true,
    description: 'User annotation/note on the highlight',
  })
  @IsOptional()
  @IsString()
  annotation?: string

  @Field(() => String, {
    nullable: true,
    description: 'Highlight color (yellow, red, green, blue)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['yellow', 'red', 'green', 'blue'])
  color?: string
}
