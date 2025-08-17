import { ApiProperty } from '@nestjs/swagger';
import { PageData } from '../type/page-type';

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
    description: '페이지 목록',
    type: [PageDto],
  })
  pages!: PageDto[];

  static from(pages: PageData[]): PageListDto {
    return {
      pages: PageDto.fromArray(pages),
    };
  }
}
