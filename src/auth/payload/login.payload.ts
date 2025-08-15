import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPayload {
  @IsInt()
  @ApiProperty({
    description: '유저 ID',
    type: Number,
  })
  userId!: number;
}
