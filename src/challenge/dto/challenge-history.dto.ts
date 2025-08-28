import { ApiProperty } from '@nestjs/swagger';
import { ChallengeDto } from './challenge.dto';
import { ParticipantDto } from './participant.dto';
import { ParticipantStatus as PrismaParticipantStatus } from '@prisma/client';
import { ChallengeHistoryData } from '../type/challenge-history-data.type';

export enum ParticipantStatus {
  JOINED = 'JOINED',
  LEFT = 'LEFT',
}

export class ChallengeHistoryDto {
  @ApiProperty({
    description: '챌린지 DTO',
    type: ChallengeDto,
  })
  challenge!: ChallengeDto;

  @ApiProperty({
    description: '참여자 DTO',
    type: ParticipantDto,
  })
  participant!: ParticipantDto;

  @ApiProperty({
    description: '참여자 상태',
    enum: ParticipantStatus,
  })
  participantStatus!: PrismaParticipantStatus;

  static from(data: ChallengeHistoryData): ChallengeHistoryDto {
    return {
      challenge: ChallengeDto.from(data.challengeData),
      participant: ParticipantDto.from(data.participantData),
      participantStatus: data.participantStatus,
    };
  }
}

export class ChallengeHistoryListDto {
  @ApiProperty({
    description: '챌린지 히스토리 목록',
    type: [ChallengeHistoryDto],
  })
  histories!: ChallengeHistoryDto[];

  static from(data: ChallengeHistoryData[]): ChallengeHistoryListDto {
    return {
      histories: data.map((item) => ChallengeHistoryDto.from(item)),
    };
  }
}
