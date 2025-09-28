import { ApiProperty } from '@nestjs/swagger';
import { BasicBookDto } from '../basic-book.dto';
import { ReadingBookData } from '../../type/history/reading-book-data.type';

export class ReadingBookDto {
  @ApiProperty({
    description: '책 정보',
    type: BasicBookDto,
  })
  book!: BasicBookDto;

  @ApiProperty({
    description: '마지막 독서 페이지 번호',
    type: Number,
  })
  lastPageNumber!: number;

  static from(data: ReadingBookData, url?: string | null): ReadingBookDto {
    return {
      book: BasicBookDto.from(data.book, url),
      lastPageNumber: data.lastPageNumber,
    };
  }

  static fromArray(
    data: ReadingBookData[],
    url?: (string | null)[],
  ): ReadingBookDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((book, index) => ReadingBookDto.from(book, urls[index]));
  }
}
