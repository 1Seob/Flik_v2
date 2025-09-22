import { ApiProperty } from '@nestjs/swagger';
import { ReadingStreakData } from '../type/reading-streak-data.type';
import { format } from 'date-fns-tz';

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
    type: String,
    format: 'date-time',
  })
  lastUpdatedAt!: string;

  static from(data: ReadingStreakData): ReadingStreakDto {
    return {
      currentStreak: data.currentStreak,
      readToday: data.readToday,
      longestStreak: data.longestStreak,
      lastUpdatedAt: this.toKST(data.lastUpdatedAt),
    };
  }

  static toKST(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'Asia/Seoul' });
  }
}
