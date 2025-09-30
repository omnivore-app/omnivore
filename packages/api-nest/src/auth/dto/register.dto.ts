import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newuser@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @ApiProperty({
    description: 'User password',
    example: 'securepassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string

  @ApiPropertyOptional({
    description: 'Invite code for group membership',
    example: 'ABC12345',
  })
  @IsOptional()
  @IsString()
  inviteCode?: string
}
