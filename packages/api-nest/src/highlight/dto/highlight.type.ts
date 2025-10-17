import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql'
import { HighlightType, RepresentationType } from '../entities/highlight.entity'

registerEnumType(HighlightType, {
  name: 'HighlightType',
})

registerEnumType(RepresentationType, {
  name: 'RepresentationType',
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

  @Field({ nullable: true })
  color?: string | null

  @Field(() => RepresentationType)
  representation!: RepresentationType
}
