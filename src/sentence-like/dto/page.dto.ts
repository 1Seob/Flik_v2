import { ApiProperty } from '@nestjs/swagger';
import { PageData } from '../type/page-type';
import { DownloadedBookDto } from '../../book/dto/downloaded-book.dto';

export class PageDto {
  @ApiProperty({
    description: '페이지 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '페이지 내용',
    type: String,
  })
  content!: string;

  @ApiProperty({
    description: '페이지 번호',
    type: Number,
  })
  number!: number;

  @ApiProperty({
    description: '페이지의 책 ID',
    type: Number,
  })
  bookId!: number;

  static from(data: PageData): PageDto {
    return {
      id: data.id,
      content: data.content,
      number: data.number,
      bookId: data.bookId,
    };
  }

  static fromArray(pages: PageData[]): PageDto[] {
    return pages.map((page) => this.from(page));
  }
}

export class PageListDto {
  @ApiProperty({
    description: '책 정보',
    type: DownloadedBookDto,
  })
  book!: DownloadedBookDto;

  @ApiProperty({
    description: '페이지 총 개수',
    type: Number,
  })
  totalPages!: number;

  @ApiProperty({
    description: '페이지 목록',
    type: [PageDto],
  })
  pages!: PageDto[];

  static from(
    book: DownloadedBookDto,
    totalPagesCount: number,
    pages: PageData[],
    url?: string | null,
  ): PageListDto {
    return {
      book,
      totalPages: totalPagesCount,
      pages: PageDto.fromArray(pages),
    };
  }
}
