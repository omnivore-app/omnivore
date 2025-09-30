import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class ConfirmEmailDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'abc123def456...',
  })
  @IsString()
  @IsNotEmpty()
  token: string
}
