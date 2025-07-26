import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GenderEnum } from 'src/auth/payload/sign-up.payload';
import { Gender as PrismaGender } from '@prisma/client';
import { Type, Transform } from 'class-transformer';

export class UpdateUserPayload {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiPropertyOptional({
    description: '로그인 ID',
    type: String,
  })
  loginId?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiPropertyOptional({
    description: '닉네임',
    type: String,
  })
  name?: string | null;

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
  @ApiPropertyOptional({
    description: '프로필 이미지',
    type: 'string',
    format: 'binary',
  })
  profileImage?: Express.Multer.File;

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
    if (value === undefined || value === null) {
      return []; // 또는 return undefined; ← @IsOptional일 때만
    }

    if (Array.isArray(value)) {
      return value.map(Number);
    }

    if (typeof value === 'string') {
      return value.split(',').map((v) => Number(v.trim()));
    }

    return [Number(value)];
  })
  @IsInt({ each: true })
  @ApiPropertyOptional({
    description: '관심 카테고리 ID',
    type: [Number],
  })
  interestCategories?: number[] | null;
}
