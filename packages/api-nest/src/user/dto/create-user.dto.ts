import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole } from '../enums/user-role.enum'
import { RegistrationType } from '../entities/user.entity'

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string

  @ApiPropertyOptional({
    description: 'User password (for email registration)',
    example: 'securepassword123',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @ApiPropertyOptional({
    description: 'Registration source',
    enum: RegistrationType,
    default: RegistrationType.EMAIL,
  })
  @IsOptional()
  @IsEnum(RegistrationType)
  source?: RegistrationType

  @ApiPropertyOptional({
    description: 'Source user ID (from OAuth provider)',
    example: 'google_123456789',
  })
  @IsOptional()
  @IsString()
  sourceUserId?: string

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional({
    description: 'Username for profile',
    example: 'johndoe123',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Software developer and avid reader',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  pictureUrl?: string

  @ApiPropertyOptional({
    description: 'Whether profile is public',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
