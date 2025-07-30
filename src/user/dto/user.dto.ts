import { ApiProperty } from '@nestjs/swagger';
import { UserData } from '../type/user-data.type';
import { Gender as PrismaGender } from '@prisma/client';
import { GenderEnum } from '../../auth/payload/sign-up.payload';

export class UserDto {
  @ApiProperty({
    description: '유저 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '로그인 ID',
    type: String,
  })
  username!: string;

  @ApiProperty({
    description: '성별',
    enum: GenderEnum,
  })
  gender!: PrismaGender;

  @ApiProperty({
    description: '생년월일',
    type: Date,
  })
  birthday!: Date;

  @ApiProperty({
    description: '프로필 이미지 경로',
    type: String,
  })
  profileImagePath?: string | null;

  @ApiProperty({
    description: '이메일',
    type: String,
  })
  email!: string;

  @ApiProperty({
    description: '이름',
    type: String,
  })
  nickname!: string;

  static from(data: UserData): UserDto {
    return {
      id: data.id,
      username: data.loginId,
      gender: data.gender,
      birthday: data.birthday,
      profileImagePath: data.profileImagePath,
      email: data.email,
      nickname: data.name,
    };
  }
}
