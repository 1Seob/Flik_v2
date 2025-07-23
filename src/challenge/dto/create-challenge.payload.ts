import { IsEnum } from 'class-validator';
import { ChallengeType } from '../enums/challenge-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChallengePayload {
  @ApiProperty({
    enum: ChallengeType,
    description: '챌린지 유형 (NONE, WEEKLY, MONTHLY)',
  })
  @IsEnum(ChallengeType)
  challengeType!: ChallengeType;
}
