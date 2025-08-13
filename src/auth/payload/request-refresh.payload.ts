import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestRefreshPayload {
  @IsString()
  @ApiProperty({
    description: '기존 Refresh token',
    type: String,
  })
  refreshToken!: string;
}
