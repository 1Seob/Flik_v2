import {
  IsDate,
  IsEmail,
  IsString,
  IsEnum,
  IsArray,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender as PrismaGender } from '@prisma/client';
import { Type, Transform } from 'class-transformer';

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class SignUpPayload {
  @IsString()
  @MinLength(4, { message: '아이디는 최소 4자 이상이어야 합니다.' })
  @MaxLength(20, { message: '아이디는 최대 20자까지 가능합니다.' })
  @Matches(/^[a-z][a-z0-9._]{3,19}$/, {
    message:
      '아이디는 최소 4자면서 영문 소문자로 시작하고, 영문 소문자/숫자/밑줄/마침표만 사용할 수 있습니다.',
  })
  @ApiProperty({
    description: '로그인 ID',
    type: String,
  })
  username!: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(50, { message: '비밀번호는 최대 50자까지 가능합니다.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: '비밀번호는 영문 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.',
  })
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  password!: string;

  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9_-]{2,20}$/, {
    message:
      '닉네임은 한글, 영문, 숫자, 밑줄(_) 또는 하이픈(-)만 사용할 수 있습니다.',
  })
  @ApiProperty({
    description: '닉네임',
    type: String,
  })
  nickname!: string;

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
    description: '관심 카테고리',
    type: [Number],
  })
  interestCategories!: number[];
}
