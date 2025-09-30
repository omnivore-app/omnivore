import { PartialType, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import { CreateUserDto } from './create-user.dto'

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Username',
    example: 'johndoe123',
  })
  @IsOptional()
  @IsString()
  username?: string

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Updated bio',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/new-avatar.jpg',
  })
  @IsOptional()
  @IsString()
  pictureUrl?: string

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://johndoe.com',
  })
  @IsOptional()
  @IsString()
  website?: string
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Profile updates',
    type: UpdateProfileDto,
  })
  @IsOptional()
  profile?: UpdateProfileDto
}
