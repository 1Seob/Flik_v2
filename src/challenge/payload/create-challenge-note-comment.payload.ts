import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateChallengeNoteCommentPayload {
  @IsInt()
  @ApiProperty({
    description: '독서 노트 ID',
    type: Number,
  })
  noteId!: number;

  @IsString()
  @MinLength(1, { message: '댓글 내용은 최소 1자 이상이어야 합니다.' })
  @ApiProperty({
    description: '댓글 내용',
    type: String,
  })
  content!: string;
}
