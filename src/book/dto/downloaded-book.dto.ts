import { ApiProperty } from '@nestjs/swagger';
import { BookData } from 'src/book/type/book-data.type';

export class DownloadedBookDto {
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

  static from(data: BookData, url?: string | null): DownloadedBookDto {
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      totalPages: data.totalPagesCount,
      coverImageUrl: url ?? null,
    };
  }

  static fromArray(
    data: BookData[],
    url?: (string | null)[],
  ): DownloadedBookDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((book, index) => DownloadedBookDto.from(book, urls[index]));
  }
}
