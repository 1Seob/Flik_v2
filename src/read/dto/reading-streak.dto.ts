import { ApiProperty } from '@nestjs/swagger';
import { ReadingStreakData } from '../type/reading-streak-data.type';

export class ReadingStreakDto {
  @ApiProperty({
    description: '현재 연속 독서일',
    type: Number,
  })
  currentStreak!: number;

  @ApiProperty({
    description: '오늘 독서 여부',
    type: Boolean,
  })
  readToday!: boolean;

  @ApiProperty({
    description: '최대 연속 독서일',
    type: Number,
  })
  longestStreak!: number;

  @ApiProperty({
    description: '마지막 업데이트 일시',
    type: Date,
  })
  lastUpdatedAt!: Date;

  static from(data: ReadingStreakData): ReadingStreakDto {
    return {
      currentStreak: data.currentStreak,
      readToday: data.readToday,
      longestStreak: data.longestStreak,
      lastUpdatedAt: data.lastUpdatedAt,
    };
  }
}
