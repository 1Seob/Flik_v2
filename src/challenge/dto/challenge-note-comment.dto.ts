import { ApiProperty } from '@nestjs/swagger';
import { ChallengeNoteCommentData } from '../type/challenge-note-comment-data.type';

export class ChallengeNoteCommentDto {
  @ApiProperty({
    description: 'ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '독서 노트 ID',
    type: Number,
  })
  noteId!: number;

  @ApiProperty({
    description: '작성자 ID',
    type: String,
  })
  userId!: string;

  @ApiProperty({
    description: '댓글 내용',
    type: String,
  })
  content!: string;

  @ApiProperty({
    description: '댓글 작성일',
    type: Date,
  })
  createdAt!: Date;

  static from(data: ChallengeNoteCommentData): ChallengeNoteCommentDto {
    return {
      id: data.id,
      noteId: data.noteId,
      userId: data.userId,
      content: data.content,
      createdAt: data.createdAt,
    };
  }

  static fromArray(
    data: ChallengeNoteCommentData[],
  ): ChallengeNoteCommentDto[] {
    return data.map((item) => this.from(item));
  }
}

export class ChallengeNoteCommentListDto {
  @ApiProperty({
    description: '댓글 목록',
    type: [ChallengeNoteCommentDto],
  })
  comments!: ChallengeNoteCommentDto[];

  static from(data: ChallengeNoteCommentData[]): ChallengeNoteCommentListDto {
    return {
      comments: ChallengeNoteCommentDto.fromArray(data),
    };
  }
}
