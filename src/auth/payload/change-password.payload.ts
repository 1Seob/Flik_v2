import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { MinLength, Matches } from 'class-validator';

export class ChangePasswordPayload {
  @IsString()
  @ApiProperty({
    description: '현재 비밀번호',
    type: String,
  })
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(50, { message: '비밀번호는 최대 50자까지 가능합니다.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: '비밀번호는 영문 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.',
  })
  @ApiProperty({
    description: '새 비밀번호',
    type: String,
  })
  newPassword!: string;
}
