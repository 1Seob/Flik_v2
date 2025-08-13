import {
  IsDate,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender as PrismaGender } from '@prisma/client';
import { Type, Transform } from 'class-transformer';
import { GenderEnum } from '../dto/user.dto';

export class UpdateUserPayload {
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
  birthDate?: Date | null;
}
