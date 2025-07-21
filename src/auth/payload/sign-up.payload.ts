import {
  IsDate,
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender as PrismaGender } from '@prisma/client';
import { Type } from 'class-transformer';

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class SignUpPayload {
  @IsString()
  @ApiProperty({
    description: '로그인 ID',
    type: String,
  })
  loginId!: string;

  @IsString()
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  password!: string;

  @IsString()
  @ApiProperty({
    description: '비밀번호 확인',
    type: String,
  })
  passwordConfirm!: string;

  @IsString()
  @ApiProperty({
    description: '닉네임',
    type: String,
  })
  name!: string;

  @IsEmail()
  @ApiProperty({
    description: '이메일',
    type: String,
  })
  email!: string;

  @IsEnum(GenderEnum)
  @ApiProperty({
    description: '성별',
    enum: GenderEnum,
  })
  gender!: PrismaGender;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: '생년월일',
    type: Date,
  })
  birthday!: Date;

  @IsOptional()
  @ApiPropertyOptional({
    description: '프로필 이미지',
    type: 'string',
    format: 'binary',
  })
  profileImage?: string;

  @IsArray()
  @IsInt({ each: true })
  @ApiProperty({
    description: '관심 카테고리',
    type: [Number],
  })
  interestCategories!: number[];
}
