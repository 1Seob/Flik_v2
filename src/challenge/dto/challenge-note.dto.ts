import { ApiProperty } from '@nestjs/swagger';
import { ChallengeNoteWithCountData } from '../type/challenge-note-with-count-data.type';

export class ChallengeNoteDto {
  @ApiProperty({
    description: '독서 노트 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '챌린지 ID',
    type: Number,
  })
  challengeId!: number;

  @ApiProperty({
    description: '작성자 ID',
    type: String,
  })
  authorId!: string;

  @ApiProperty({
    description: '본문',
    type: String,
  })
  body!: string;

  @ApiProperty({
    description: '인용문',
    type: String,
    nullable: true,
  })
  quote!: string | null;

  @ApiProperty({
    description: '작성일',
    type: Date,
  })
  createdAt!: Date;

  @ApiProperty({
    description: '좋아요 수',
    type: Number,
  })
  likesCount!: number;

  @ApiProperty({
    description: '댓글 수',
    type: Number,
  })
  commentsCount!: number;

  @ApiProperty({
    description: '좋아요 여부',
    type: Boolean,
  })
  liked!: boolean;

  @ApiProperty({
    description: '이미지 경로',
    type: String,
    nullable: true,
  })
  imagePath!: string | null;

  static from(data: ChallengeNoteWithCountData): ChallengeNoteDto {
    return {
      id: data.id,
      authorId: data.authorId,
      challengeId: data.challengeId,
      body: data.body,
      quote: data.quoteText,
      createdAt: data.createdAt,
      likesCount: data.likesCount,
      commentsCount: data.commentsCount,
      imagePath: data.imagePath,
      liked: data.liked,
    };
  }

  static fromArray(data: ChallengeNoteWithCountData[]): ChallengeNoteDto[] {
    return data.map((item) => this.from(item));
  }
}

export class ChallengeNoteListDto {
  @ApiProperty({
    description: '챌린지 노트 목록',
    type: [ChallengeNoteDto],
  })
  notes!: ChallengeNoteDto[];

  static from(data: ChallengeNoteWithCountData[]): ChallengeNoteListDto {
    return {
      notes: ChallengeNoteDto.fromArray(data),
    };
  }
}
