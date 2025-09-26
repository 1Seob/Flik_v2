import { ApiProperty } from '@nestjs/swagger';
import { BookData } from '../type/book-data.type';

export class BasicBookDto {
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
    description: '총 페이지 수',
    type: Number,
  })
  totalPages!: number;

  @ApiProperty({
    description: '책 커버 이미지 URL',
    type: String,
    nullable: true,
  })
  coverImageUrl!: string | null;

  static from(data: BookData, url?: string | null): BasicBookDto {
    return {
      id: data.id,
      title: data.title,
      totalPages: data.totalPagesCount,
      coverImageUrl: url ?? null,
    };
  }

  static fromArray(data: BookData[], url?: (string | null)[]): BasicBookDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((book, index) => BasicBookDto.from(book, urls[index]));
  }
}

export class BasicBookListDto {
  @ApiProperty({
    description: '책 목록',
    type: [BasicBookDto],
  })
  books!: BasicBookDto[];

  static from(data: BookData[], url?: (string | null)[]): BasicBookListDto {
    const urls = url ?? data.map(() => null);
    return {
      books: BasicBookDto.fromArray(data, urls),
    };
  }
}
