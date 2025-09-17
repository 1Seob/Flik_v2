import { ApiProperty } from '@nestjs/swagger';
import { BookDto } from './book.dto';
import { BookRankingWithStatusData } from '../type/book-ranking-data-with-status-data.type';

export enum RankStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  NEW = 'NEW',
  SAME = 'SAME', // 순위 변동 없음
}

export class BookRankingDto {
  @ApiProperty({
    description: '책 랭킹',
    type: Number,
  })
  rank!: number;

  @ApiProperty({
    description: '책 정보',
    type: BookDto,
  })
  book!: BookDto;

  @ApiProperty({
    description: '랭킹 상태 (UP, DOWN, NEW, SAME)',
    enum: RankStatus,
  })
  status!: RankStatus;

  @ApiProperty({
    description: '랭킹 변동 폭',
    type: Number,
    nullable: true,
  })
  rankChange!: number | null;

  static from(
    data: BookRankingWithStatusData,
    url?: string | null,
  ): BookRankingDto {
    return {
      rank: data.rank,
      book: BookDto.from(data.book, url),
      status: data.status,
      rankChange: data.rankChange,
    };
  }

  static fromArray(
    data: BookRankingWithStatusData[],
    url?: (string | null)[],
  ): BookRankingDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((book, index) => BookRankingDto.from(book, urls[index]));
  }
}

export class BookRankingListDto {
  @ApiProperty({
    description: '책 랭킹 리스트',
    type: [BookRankingDto],
  })
  rankings!: BookRankingDto[];

  static from(
    data: BookRankingWithStatusData[],
    url?: (string | null)[],
  ): BookRankingListDto {
    const urls = url ?? data.map(() => null);
    return {
      rankings: BookRankingDto.fromArray(data, urls),
    };
  }
}
