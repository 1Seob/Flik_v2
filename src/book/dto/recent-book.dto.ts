import { ApiProperty } from '@nestjs/swagger';
import { RecentBookData } from '../type/recent-book-data.type';
import { BookDto } from './book.dto';

export class RecentBookDto {
  @ApiProperty({
    description: '책 정보',
    type: BookDto,
  })
  book!: BookDto;

  @ApiProperty({
    description: '진행률',
    type: Number,
  })
  progress!: number;

  static from(data: RecentBookData, url?: string | null): RecentBookDto {
    return {
      book: BookDto.from(data, url),
      progress: data.progress,
    };
  }

  static fromArray(
    data: RecentBookData[],
    url?: (string | null)[],
  ): RecentBookDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((book, index) => RecentBookDto.from(book, urls[index]));
  }
}

export class RecentBookListDto {
  @ApiProperty({
    description: '최근 읽은 책 목록',
    type: [RecentBookDto],
  })
  books!: RecentBookDto[];

  static from(
    data: RecentBookData[],
    url?: (string | null)[],
  ): RecentBookListDto {
    const urls = url ?? data.map(() => null);
    return {
      books: RecentBookDto.fromArray(data, urls),
    };
  }
}
