import { IsString, IsOptional, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class GoogleWebAuthDto {
  @ApiProperty({
    description: 'Google ID token from web client',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsString()
  idToken: string

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

export class GoogleMobileAuthDto {
  @ApiProperty({
    description: 'Google ID token from mobile client',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsString()
  idToken: string

  @ApiProperty({
    description: 'Whether this is an Android client',
    example: true,
  })
  @IsBoolean()
  isAndroid: boolean
}

export class CompletePendingRegistrationDto {
  @ApiProperty({
    description: 'Pending user token from OAuth flow',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  @IsString()
  pendingToken: string

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({
    description: 'Preferred username',
    example: 'johndoe123',
  })
  @IsOptional()
  @IsString()
  username?: string

  @ApiPropertyOptional({
    description: 'User bio/description',
    example: 'Software developer interested in reading',
  })
  @IsOptional()
  @IsString()
  bio?: string
}
