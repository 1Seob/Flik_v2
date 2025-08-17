import { ApiProperty } from '@nestjs/swagger';
import { UserData } from '../type/user-data.type';
import { Gender as PrismaGender } from '@prisma/client';

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class UserDto {
  @ApiProperty({
    description: '유저 ID',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: '성별',
    enum: GenderEnum,
  })
  gender?: PrismaGender | null;

  @ApiProperty({
    description: '생년월일',
    type: Date,
  })
  birthDate?: Date | null;

  @ApiProperty({
    description: '프로필 이미지 경로',
    type: String,
  })
  profileImagePath?: string | null;

  @ApiProperty({
    description: '이름',
    type: String,
  })
  nickname!: string;

  static from(data: UserData): UserDto {
    return {
      id: data.id,
      gender: data.gender,
      birthDate: data.birthday,
      profileImagePath: data.profileImagePath,
      nickname: data.name,
    };
  }
}
