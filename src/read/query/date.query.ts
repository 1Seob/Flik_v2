import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class DateQuery {
  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: '연도',
    type: Number,
  })
  year!: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: '월',
    type: Number,
  })
  month!: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: '일',
    type: Number,
  })
  day!: number;
}
