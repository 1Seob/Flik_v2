import { ApiProperty } from '@nestjs/swagger';
import { SentenceLikeDto } from 'src/sentence-like/dto/sentence-like.dto';
import { PageData } from 'src/sentence-like/type/page-type';
import { SentenceLikeData } from 'src/sentence-like/type/sentence-like-type';

export class LastPageDto {
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
    description: '유저가 좋아요한 문장들',
    type: [SentenceLikeDto],
  })
  likedSentences!: SentenceLikeDto[];

  static from(data: PageData, likedSentences: SentenceLikeData[]): LastPageDto {
    return {
      id: data.id,
      content: data.content,
      number: data.number,
      likedSentences: SentenceLikeDto.fromArray(likedSentences),
    };
  }
}
