import { ApiProperty } from '@nestjs/swagger';
import { BookData } from '../type/book-data.type';

export class BookDto {
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
    description: '책 저자',
    type: String,
  })
  author!: string;

  @ApiProperty({
    description: 'ISBN 코드',
    type: String,
    nullable: true,
  })
  isbn!: string | null;

  @ApiProperty({
    description: '조회수',
    type: Number,
  })
  views!: number;

  @ApiProperty({
    description: '총 페이지 수',
    type: Number,
  })
  totalPages!: number;

  static from(data: BookData): BookDto {
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      views: data.views,
      totalPages: data.totalPagesCount,
    };
  }

  static fromArray(data: BookData[]): BookDto[] {
    return data.map((book) => BookDto.from(book));
  }
}

export class BookListDto {
  @ApiProperty({
    description: '책 목록',
    type: [BookDto],
  })
  books!: BookDto[];

  static from(data: BookData[]): BookListDto {
    return {
      books: BookDto.fromArray(data),
    };
  }
}
