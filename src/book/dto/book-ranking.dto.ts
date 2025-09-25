import { ApiProperty } from '@nestjs/swagger';
import { BookRankingWithStatusData } from '../type/book-ranking-data-with-status-data.type';
import { BookData } from '../type/book-data.type';

export enum RankStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  NEW = 'NEW',
  SAME = 'SAME', // 순위 변동 없음
}

export class RankChangeDto {
  @ApiProperty({
    description: '랭킹 변동 방향 (UP, DOWN, NEW, SAME)',
    enum: RankStatus,
  })
  direction!: RankStatus;

  @ApiProperty({
    description: '랭킹 변동 폭',
    type: Number,
    nullable: true,
  })
  amount!: number | null;

  static from(direction: RankStatus, amount: number | null): RankChangeDto {
    return {
      direction,
      amount: direction === RankStatus.SAME ? null : amount,
    };
  }
}

export class RankingBookDto {
  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '책 제목',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '책 커버 이미지 URL',
    type: String,
    nullable: true,
  })
  coverImageUrl!: string | null;

  static from(data: BookData, url?: string | null): RankingBookDto {
    return {
      id: data.id,
      title: data.title,
      coverImageUrl: url ?? null,
    };
  }

  static fromArray(
    data: BookData[],
    url?: (string | null)[],
  ): RankingBookDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((book, index) => RankingBookDto.from(book, urls[index]));
  }
}

export class BookRankingDto {
  @ApiProperty({
    description: '책 랭킹',
    type: Number,
  })
  rank!: number;

  @ApiProperty({
    description: '책 정보',
    type: RankingBookDto,
  })
  book!: RankingBookDto;

  @ApiProperty({
    type: RankChangeDto,
    description: '랭킹 변동 정보',
  })
  rankChange!: RankChangeDto;

  static from(
    data: BookRankingWithStatusData,
    url?: string | null,
  ): BookRankingDto {
    return {
      rank: data.rank,
      book: RankingBookDto.from(data.book, url),
      rankChange: RankChangeDto.from(data.status, data.rankChange),
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
