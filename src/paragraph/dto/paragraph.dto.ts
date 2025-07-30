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

  static fromArray(paragraphs: ParagraphData[]): ParagraphDto[] {
    return paragraphs.map((paragraph) => this.from(paragraph));
  }
}

export class ParagraphListDto {
  @ApiProperty({
    description: '문단 목록',
    type: [ParagraphDto],
  })
  paragraphs!: ParagraphDto[];

  static from(paragraphs: ParagraphData[]): ParagraphListDto {
    return {
      paragraphs: ParagraphDto.fromArray(paragraphs),
    };
  }
}
