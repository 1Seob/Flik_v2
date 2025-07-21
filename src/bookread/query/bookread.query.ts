import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class BookReadQuery {
  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: '읽은 페이지 인덱스',
    type: Number,
  })
  lastPageIndex!: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: '일일 목표 페이지 수',
    type: Number,
  })
  dailyGoal!: number;
}
