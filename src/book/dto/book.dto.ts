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
    description: '책 표지 이미지 URL',
    type: String,
    required: false,
    nullable: true,
  })
  coverImageUrl?: string;

  static from(data: BookData): BookDto {
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      coverImageUrl: data.coverImageUrl ?? undefined,
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
