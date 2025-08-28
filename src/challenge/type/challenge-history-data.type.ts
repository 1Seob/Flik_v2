import { ChallengeData } from './challenge-data.type';
import { ParticipantData } from './participant-data.type';
import { ParticipantStatus } from '@prisma/client';

export type ChallengeHistoryData = {
  challengeData: ChallengeData;
  participantData: ParticipantData;
  participantStatus: ParticipantStatus;
};
