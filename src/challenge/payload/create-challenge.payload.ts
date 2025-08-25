import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ChallengeVisibility } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateChallengePayload {
  @IsString()
  @MinLength(2, { message: '챌린지 이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(25, { message: '챌린지 이름은 최대 25자 이하여야 합니다.' })
  @ApiProperty({
    description: '챌린지 이름',
    type: String,
  })
  name!: string;

  @IsInt()
  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @IsEnum(ChallengeVisibility)
  @ApiProperty({
    description: '가시성',
    enum: ChallengeVisibility,
  })
  visibility!: ChallengeVisibility;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: '시작 시간',
    type: Date,
  })
  startTime!: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: '종료 시간',
    type: Date,
  })
  endTime!: Date;
}
