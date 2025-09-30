import {
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class AppleUserNameDto {
  @ApiPropertyOptional({
    description: 'First name from Apple',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string

  @ApiPropertyOptional({
    description: 'Last name from Apple',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string
}

class AppleUserDataDto {
  @ApiPropertyOptional({
    description: 'User name from Apple',
    type: AppleUserNameDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AppleUserNameDto)
  name?: AppleUserNameDto

  @ApiPropertyOptional({
    description: 'Email from Apple (only provided on first sign-in)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string
}

export class AppleWebAuthDto {
  @ApiProperty({
    description: 'Apple ID token from web client',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsString()
  idToken: string

  @ApiPropertyOptional({
    description: 'User data from Apple (only provided on first sign-in)',
    type: AppleUserDataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AppleUserDataDto)
  user?: AppleUserDataDto

  @ApiPropertyOptional({
    description: 'Whether this is a local development request',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isLocal?: boolean

  @ApiPropertyOptional({
    description: 'Whether this is a Vercel deployment request',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isVercel?: boolean
}

export class AppleMobileAuthDto {
  @ApiProperty({
    description: 'Apple ID token from mobile client',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsString()
  idToken: string

  @ApiPropertyOptional({
    description: 'User data from Apple (only provided on first sign-in)',
    type: AppleUserDataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AppleUserDataDto)
  user?: AppleUserDataDto
}
