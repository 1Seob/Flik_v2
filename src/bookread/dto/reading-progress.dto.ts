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

  @ApiProperty({
    description: '하루 목표 페이지 수',
    type: Number,
  })
  dailyGoal!: number;

  @ApiProperty({
    description: '달성률(읽은 페이지 수 / 하루 목표 페이지 수)',
    type: Number,
  })
  progressRate!: number;

  static from(
    book: BookData,
    pagesRead: number,
    dailyGoal: number,
    progressRate: number,
  ): ReadingProgressDto {
    const dto = new ReadingProgressDto();
    dto.book = book;
    dto.pagesRead = pagesRead;
    dto.dailyGoal = dailyGoal;
    dto.progressRate = progressRate;
    return dto;
  }

  static fromArray(
    books: BookData[],
    pagesRead: number[],
    dailyGoal: number[],
    progressRates: number[],
  ): ReadingProgressDto[] {
    return books.map((book, index) => {
      return ReadingProgressDto.from(
        book,
        pagesRead[index],
        dailyGoal[index],
        progressRates[index],
      );
    });
  }
}

export class ReadingProgressListDto {
  @ApiProperty({
    description: '읽기 진행 목록',
    type: [ReadingProgressDto],
  })
  books!: ReadingProgressDto[];

  static from(
    books: BookData[],
    pagesRead: number[],
    dailyGoal: number[],
    progressRates: number[],
  ): ReadingProgressListDto {
    const dto = new ReadingProgressListDto();
    dto.books = ReadingProgressDto.fromArray(
      books,
      pagesRead,
      dailyGoal,
      progressRates,
    );
    return dto;
  }
}
