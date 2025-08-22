import { ApiProperty } from '@nestjs/swagger';
import { ChallengeVisibility } from '@prisma/client';
import { ChallengeStatus } from '../enum/challenge.enum';
import { ChallengeData } from '../type/challenge-data.type';

export class ChallengeDto {
  @ApiProperty({
    description: '챌린지 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '챌린지 이름',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '호스트 ID',
    type: String,
  })
  hostId!: string;

  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @ApiProperty({
    description: '가시성',
    enum: ChallengeVisibility,
  })
  visibility!: ChallengeVisibility;

  @ApiProperty({
    description: '시작 시간',
    type: Date,
  })
  startTime!: Date;

  @ApiProperty({
    description: '종료 시간',
    type: Date,
  })
  endTime!: Date;

  @ApiProperty({
    description: '챌린지의 현재 상태',
    enum: ChallengeStatus,
  })
  currentStatus!: ChallengeStatus;

  static from(data: ChallengeData): ChallengeDto {
    return {
      id: data.id,
      name: data.name,
      hostId: data.hostId,
      bookId: data.bookId,
      visibility: data.visibility,
      startTime: data.startTime,
      endTime: data.endTime,
      currentStatus: data.completedAt
        ? ChallengeStatus.COMPLETED
        : data.cancelledAt
          ? ChallengeStatus.CANCELLED
          : data.startTime > new Date()
            ? ChallengeStatus.PREPARING
            : ChallengeStatus.ACTIVE,
    };
  }
}
