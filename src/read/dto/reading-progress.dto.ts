import { ApiProperty } from '@nestjs/swagger';
import { ReadingProgressData } from '../type/reading-progress-data.type';
import { BookDto } from 'src/book/dto/book.dto';

export class ReadingProgressDto {
  @ApiProperty({
    description: '읽은 책',
    type: BookDto,
  })
  book!: BookDto;

  @ApiProperty({
    description: '마지막 독서 페이지 번호',
    type: Number,
  })
  lastPageNumber!: number;

  static from(data: ReadingProgressData): ReadingProgressDto {
    return {
      book: BookDto.from(data.book),
      lastPageNumber: data.lastPageNumber,
    };
  }

  static fromArray(data: ReadingProgressData[]): ReadingProgressDto[] {
    return data.map((item) => ReadingProgressDto.from(item));
  }
}

export class ReadingProgressListDto {
  @ApiProperty({
    description: '읽기 진행 목록',
    type: [ReadingProgressDto],
  })
  progresses!: ReadingProgressDto[];

  static from(data: ReadingProgressData[]): ReadingProgressListDto {
    return {
      progresses: ReadingProgressDto.fromArray(data),
    };
  }
}
