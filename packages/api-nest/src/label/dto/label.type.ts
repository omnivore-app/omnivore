import { ObjectType, Field, ID, Int } from '@nestjs/graphql'

@ObjectType()
export class Label {
  @Field(() => ID)
  id!: string

  @Field()
  name!: string

  @Field()
  color!: string

  @Field({ nullable: true })
  description?: string | null

  @Field(() => Int)
  position!: number

  @Field()
  internal!: boolean

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}
