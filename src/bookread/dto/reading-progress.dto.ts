import { ApiProperty } from '@nestjs/swagger';
import { BookData } from 'src/book/type/book-data.type';

export class ReadingProgressDto {
  @ApiProperty({
    description: '읽은 책',
    type: Object,
  })
  book!: BookData;

  @ApiProperty({
    description: '읽은 페이지 수',
    type: Number,
  })
  pagesRead!: number;

  static from(book: BookData, pagesRead: number): ReadingProgressDto {
    const dto = new ReadingProgressDto();
    dto.book = book;
    dto.pagesRead = pagesRead;
    return dto;
  }

  static fromArray(
    books: BookData[],
    pagesRead: number[],
  ): ReadingProgressDto[] {
    return books.map((book, index) => {
      return ReadingProgressDto.from(book, pagesRead[index]);
    });
  }
}

export class ReadingProgressListDto {
  @ApiProperty({
    description: '읽기 진행 목록',
    type: [ReadingProgressDto],
  })
  books!: ReadingProgressDto[];

  static from(books: BookData[], pagesRead: number[]): ReadingProgressListDto {
    const dto = new ReadingProgressListDto();
    dto.books = ReadingProgressDto.fromArray(books, pagesRead);
    return dto;
  }
}
