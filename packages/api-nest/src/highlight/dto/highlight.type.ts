import {
  Field,
  Float,
  ID,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql'
import { GraphQLJSON } from 'graphql-scalars'

import {
  HighlightColor,
  HighlightType,
  RepresentationType,
} from '../entities/highlight.entity'
import { HighlightSelectors } from '../entities/highlight-selector.interface'

registerEnumType(HighlightType, {
  name: 'HighlightType',
})

registerEnumType(RepresentationType, {
  name: 'RepresentationType',
})

registerEnumType(HighlightColor, {
  name: 'HighlightColor',
  description: 'Highlight color options',
})

@ObjectType()
export class Highlight {
  @Field(() => ID)
  id!: string

  @Field()
  shortId!: string

  @Field()
  libraryItemId!: string

  @Field({ nullable: true })
  quote?: string | null

  @Field({ nullable: true })
  prefix?: string | null

  @Field({ nullable: true })
  suffix?: string | null

  @Field({ nullable: true })
  patch?: string | null

  @Field({ nullable: true })
  annotation?: string | null

  @Field(() => Date)
  createdAt!: Date

  @Field(() => Date)
  updatedAt!: Date

  @Field(() => Date, { nullable: true })
  sharedAt?: Date | null

  @Field(() => Float)
  highlightPositionPercent!: number

  @Field(() => Int)
  highlightPositionAnchorIndex!: number

  @Field(() => HighlightType)
  highlightType!: HighlightType

  @Field({ nullable: true })
  html?: string | null

  @Field(() => HighlightColor)
  color!: HighlightColor

  @Field(() => RepresentationType)
  representation!: RepresentationType

  @Field(() => GraphQLJSON, {
    description:
      'Web Annotation selectors for robust text positioning (W3C standard)',
  })
  selectors!: HighlightSelectors

  @Field(() => String, {
    nullable: true,
    description: 'Optional content version/hash for tracking',
  })
  contentVersion?: string | null
}
