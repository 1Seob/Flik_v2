import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPayload {
  @IsString()
  @ApiProperty({
    description: '로그인 ID',
    type: String,
  })
  username!: string;

  @IsString()
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  password!: string;
}
