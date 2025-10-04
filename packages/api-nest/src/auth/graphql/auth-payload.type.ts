import { Field, ObjectType } from '@nestjs/graphql'
import { User } from '../../user/entities/user.entity'

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  accessToken!: string

  @Field(() => String, { defaultValue: 'Bearer' })
  tokenType?: string

  @Field(() => String, { nullable: true })
  expiresIn?: string

  @Field(() => User)
  user!: User
}
