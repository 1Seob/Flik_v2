import { ApiProperty } from '@nestjs/swagger';
import { PageData } from 'src/sentence-like/type/page-type';

export class LastPageDto {
  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @ApiProperty({
    description: '페이지 ID',
    type: Number,
  })
  pageId!: number;

  @ApiProperty({
    description: '페이지 번호',
    type: Number,
  })
  number!: number;

  static from(bookId: number, data: PageData): LastPageDto {
    return {
      bookId,
      pageId: data.id,
      number: data.number,
    };
  }
}
