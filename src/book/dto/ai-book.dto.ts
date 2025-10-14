import { ApiProperty } from '@nestjs/swagger';
import { BookWithSummaryData } from '../type/book-with-summary.type';

export class AiBookDto {
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
    description: '책 요약',
    type: String,
  })
  summary!: string;

  @ApiProperty({
    description: '책 커버 이미지 URL',
    type: String,
    nullable: true,
  })
  coverImageUrl!: string | null;

  static from(data: BookWithSummaryData, url?: string | null): AiBookDto {
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      summary: data.summary,
      coverImageUrl: url ?? null,
    };
  }

  static fromArray(
    data: BookWithSummaryData[],
    url?: (string | null)[],
  ): AiBookDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((book, index) => AiBookDto.from(book, urls[index]));
  }
}

export class AiBookListDto {
  @ApiProperty({
    description: 'AI 요약 책 목록',
    type: [AiBookDto],
  })
  books!: AiBookDto[];

  static from(
    data: BookWithSummaryData[],
    url?: (string | null)[],
  ): AiBookListDto {
    return {
      books: AiBookDto.fromArray(data, url),
    };
  }
}
