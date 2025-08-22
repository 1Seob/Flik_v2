import { ApiProperty } from '@nestjs/swagger';
import { ReadingLogData } from '../type/reading-log-data.type';

export class ReadingLogDto {
  @ApiProperty({
    description: '독서 로그 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '유저 ID',
    type: String,
  })
  userId!: string;

  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @ApiProperty({
    description: '페이지 ID',
    type: Number,
  })
  pageId!: number;

  @ApiProperty({
    description: '페이지 번호',
    type: Number,
  })
  pageNumber!: number;

  @ApiProperty({
    description: '챌린지 참여 ID',
    type: Number,
    nullable: true,
  })
  participantId!: number | null;

  @ApiProperty({
    description: '읽기 시작 시간',
    type: Date,
    nullable: true,
  })
  startedAt!: Date | null;

  @ApiProperty({
    description: '읽기 종료 시간',
    type: Date,
    nullable: true,
  })
  endedAt!: Date | null;

  @ApiProperty({
    description: '읽기 소요 시간',
    type: Number,
    nullable: true,
  })
  durationSec!: number | null;

  static from(data: ReadingLogData): ReadingLogDto {
    return {
      id: data.id,
      userId: data.userId,
      bookId: data.bookId,
      pageId: data.pageId,
      pageNumber: data.pageNumber,
      participantId: data.participantId,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      durationSec: data.durationSec,
    };
  }

  static fromArray(data: ReadingLogData[]): ReadingLogDto[] {
    return data.map((log) => ReadingLogDto.from(log));
  }
}

export class ReadingLogListDto {
  @ApiProperty({
    description: '독서 로그 목록',
    type: [ReadingLogDto],
  })
  logs!: ReadingLogDto[];

  static from(data: ReadingLogData[]): ReadingLogListDto {
    return {
      logs: ReadingLogDto.fromArray(data),
    };
  }
}
