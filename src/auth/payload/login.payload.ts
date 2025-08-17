import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPayload {
  @IsString()
  @ApiProperty({
    description: '유저 ID',
    type: String,
  })
  userId!: string;
}
