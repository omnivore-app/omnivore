import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsOptional, Matches, Length } from 'class-validator'

@InputType()
export class CreateLabelInput {
  @Field()
  @IsString()
  @Length(1, 100)
  name!: string

  @Field({ nullable: true, defaultValue: '#000000' })
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color code (e.g., #FF5733)',
  })
  @IsOptional()
  color?: string

  @Field({ nullable: true })
  @IsString()
  @Length(0, 500)
  @IsOptional()
  description?: string
}

@InputType()
export class UpdateLabelInput {
  @Field({ nullable: true })
  @IsString()
  @Length(1, 100)
  @IsOptional()
  name?: string

  @Field({ nullable: true })
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color code (e.g., #FF5733)',
  })
  @IsOptional()
  color?: string

  @Field({ nullable: true })
  @IsString()
  @Length(0, 500)
  @IsOptional()
  description?: string
}
