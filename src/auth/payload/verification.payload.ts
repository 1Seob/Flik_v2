import { IsEmail, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerificationPayload {
  @IsEmail()
  @ApiProperty({
    description: '이메일 주소',
    type: String,
  })
  email!: string;

  @IsNumberString()
  @ApiProperty({
    description: '인증 코드',
    type: String,
  })
  code!: string;
}
