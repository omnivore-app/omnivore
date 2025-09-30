import {
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsEnum,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class MobileUserNameDto {
  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string
}

class MobileUserDataDto {
  @ApiPropertyOptional({
    description: 'User name',
    type: MobileUserNameDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MobileUserNameDto)
  name?: MobileUserNameDto

  @ApiPropertyOptional({
    description: 'Email (only provided on first sign-in for some providers)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string
}

export class MobileSignInDto {
  @ApiProperty({
    description: 'OAuth token from mobile provider',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsString()
  token: string

  @ApiProperty({
    description: 'OAuth provider',
    enum: ['GOOGLE', 'APPLE'],
    example: 'GOOGLE',
  })
  @IsEnum(['GOOGLE', 'APPLE'])
  provider: 'GOOGLE' | 'APPLE'

  @ApiPropertyOptional({
    description: 'Whether this is an Android client (for Google OAuth)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isAndroid?: boolean

  @ApiPropertyOptional({
    description: 'User data from OAuth provider',
    type: MobileUserDataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MobileUserDataDto)
  user?: MobileUserDataDto
}

export class MobileEmailSignInDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsString()
  email: string

  @ApiProperty({
    description: 'User password',
    example: 'securepassword123',
  })
  @IsString()
  password: string
}

export class MobileEmailSignUpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newuser@example.com',
    format: 'email',
  })
  @IsString()
  email: string

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  name: string

  @ApiProperty({
    description: 'User password',
    example: 'securepassword123',
  })
  @IsString()
  password: string
}
