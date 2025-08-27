import { ApiProperty } from '@nestjs/swagger';
import { ChallengeCompleteLogData } from '../type/challenge-complete-log-data.type';

export class ChallengeCompleteLogDto {
  @ApiProperty({
    description: '날짜',
    type: String,
    format: 'date',
    example: '2025-08-27',
  })
  date!: string;

  @ApiProperty({
    description: '읽은 페이지 수',
    type: Number,
  })
  pagesRead!: number;

  static from(data: ChallengeCompleteLogData): ChallengeCompleteLogDto {
    return {
      date: data.date,
      pagesRead: data.pagesRead,
    };
  }

  static fromArray(
    data: ChallengeCompleteLogData[],
  ): ChallengeCompleteLogDto[] {
    return data.map((log) => this.from(log));
  }
}

export class ChallengeCompleteLogListDto {
  @ApiProperty({
    description: '챌린지 완료 로그 목록',
    type: [ChallengeCompleteLogDto],
  })
  logs!: ChallengeCompleteLogDto[];

  static from(data: ChallengeCompleteLogData[]): ChallengeCompleteLogListDto {
    return {
      logs: ChallengeCompleteLogDto.fromArray(data),
    };
  }
}
