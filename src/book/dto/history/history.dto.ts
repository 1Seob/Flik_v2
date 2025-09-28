import { ApiProperty } from '@nestjs/swagger';
import { ReadingBookDto } from './reading-book.dto';
import { CompletedBookDto } from './completed-book.dto';
import { ReadingBookData } from 'src/book/type/history/reading-book-data.type';
import { CompletedBookData } from 'src/book/type/history/completed-book-data.type';

export class HistoryDto {
  @ApiProperty({
    description: '독서 중 목록',
    type: [ReadingBookDto],
  })
  readingBooks!: ReadingBookDto[];

  @ApiProperty({
    description: '완독 목록',
    type: [CompletedBookDto],
  })
  completedBooks!: CompletedBookDto[];

  static from(
    readingBooks: ReadingBookData[],
    completedBooks: CompletedBookData[],
    readingUrl?: (string | null)[],
    completedUrl?: (string | null)[],
  ): HistoryDto {
    const readingUrls = readingUrl ?? readingBooks.map(() => null);
    const completedUrls = completedUrl ?? completedBooks.map(() => null);
    return {
      readingBooks: ReadingBookDto.fromArray(readingBooks, readingUrls),
      completedBooks: CompletedBookDto.fromArray(completedBooks, completedUrls),
    };
  }
}
