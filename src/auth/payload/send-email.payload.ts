import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailPayload {
  @IsEmail()
  @ApiProperty({
    description: '이메일 주소',
    type: String,
  })
  email!: string;
}
