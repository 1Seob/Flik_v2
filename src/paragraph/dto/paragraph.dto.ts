import { ApiProperty } from '@nestjs/swagger';
import { ParagraphData } from '../type/paragraph-type';

export class ParagraphDto {
  @ApiProperty({
    description: '문단 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '문단 내용',
    type: String,
  })
  content!: string;

  @ApiProperty({
    description: '문단 순서',
    type: Number,
  })
  order!: number;

  @ApiProperty({
    description: '문단의 책 ID',
    type: Number,
  })
  bookId!: number;

  static from(data: ParagraphData): ParagraphDto {
    return {
      id: data.id,
      content: data.content,
      order: data.order,
      bookId: data.bookId,
    };
  }
}
