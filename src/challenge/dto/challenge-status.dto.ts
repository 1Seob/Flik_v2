import { ApiProperty } from '@nestjs/swagger';

export class ChallengeStatusDto {
  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @ApiProperty({ example: 5, description: '챌린지 종료까지 남은 일수 (D-day)' })
  dDay!: number;

  @ApiProperty({ example: 'ONGOING', description: '챌린지 상태' })
  status!: ChallengeStatus;

  @ApiProperty({
    description: '챌린지 진행률(1-7 or 1-28)',
    type: Number,
  })
  progress!: number;

  @ApiProperty({
    description: '챌린지 시작 날짜',
    type: Date,
  })
  startDate!: Date;

  @ApiProperty({
    description: '챌린지 성공 일자',
    type: Date,
    nullable: true,
  })
  successDate!: Date | null;

  @ApiProperty({
    description: '챌린지 실패 일자',
    type: Date,
    nullable: true,
  })
  failedDate!: Date | null;
}

export class ChallengeStatusListDto {
  @ApiProperty({
    type: [ChallengeStatusDto],
    description: '챌린지 상태 목록',
  })
  challenges!: ChallengeStatusDto[];
}

export type ChallengeStatus =
  | 'ONGOING' // 아직 끝나지 않음
  | 'SUCCESS' // 기한 내 완독 성공
  | 'FAILED'; // 기한 초과 실패
