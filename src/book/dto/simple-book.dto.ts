import { ApiProperty } from '@nestjs/swagger';
import { BookData } from '../type/book-data.type';

export class SimpleBookDto {
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
    description: '책 커버 이미지 URL',
    type: String,
    nullable: true,
  })
  coverImageUrl!: string | null;

  static from(data: BookData, url?: string | null): SimpleBookDto {
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      coverImageUrl: url ?? null,
    };
  }

  static fromArray(
    data: BookData[],
    urls?: (string | null)[],
  ): SimpleBookDto[] {
    const coverImageUrls = urls ?? data.map(() => null);
    return data.map((book, index) =>
      SimpleBookDto.from(book, coverImageUrls[index]),
    );
  }
}

export class SimpleBookListDto {
  @ApiProperty({
    description: '책 목록',
    type: [SimpleBookDto],
  })
  books!: SimpleBookDto[];

  static from(data: BookData[], url?: (string | null)[]): SimpleBookListDto {
    const urls = url ?? data.map(() => null);
    return {
      books: SimpleBookDto.fromArray(data, urls),
    };
  }
}
