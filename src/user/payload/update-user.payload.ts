import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsInt,
  IsBoolean,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GenderEnum } from 'src/auth/payload/sign-up.payload';
import { Gender as PrismaGender } from '@prisma/client';
import { Type, Transform } from 'class-transformer';

export class UpdateUserPayload {
  @IsOptional()
  @IsString()
  @MinLength(4, { message: '아이디는 최소 4자 이상이어야 합니다.' })
  @MaxLength(20, { message: '아이디는 최대 20자까지 가능합니다.' })
  @Matches(/^[a-z][a-z0-9._]{3,19}$/, {
    message:
      '아이디는 최소 4자면서 영문 소문자로 시작하고, 영문 소문자/숫자/밑줄/마침표만 사용할 수 있습니다.',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiPropertyOptional({
    description: '로그인 ID',
    type: String,
  })
  username?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9_-]{2,20}$/, {
    message:
      '닉네임은 한글, 영문, 숫자, 밑줄(_) 또는 하이픈(-)만 사용할 수 있습니다.',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiPropertyOptional({
    description: '닉네임',
    type: String,
  })
  nickname?: string | null;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiPropertyOptional({
    description: '이메일',
    type: String,
  })
  email?: string | null;

  @IsEnum(GenderEnum)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiPropertyOptional({
    description: '성별',
    enum: GenderEnum,
  })
  gender?: PrismaGender | null;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  })
  @ApiPropertyOptional({
    description: '생년월일',
    type: Date,
  })
  birthday?: Date | null;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  })
  @ApiPropertyOptional({
    description: '기본 프로필 이미지로 변경 여부',
    type: Boolean,
  })
  removeProfileImage?: boolean;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map(Number).filter((v) => !isNaN(v));
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v !== '') // 빈 문자열 제거
        .map(Number)
        .filter((v) => !isNaN(v)); // NaN 제거
    }

    const num = Number(value);
    return isNaN(num) ? [] : [num];
  })
  @IsInt({ each: true })
  @ApiPropertyOptional({
    description: '관심 카테고리 ID',
    type: [Number],
  })
  interestCategories?: number[] | null;
}
