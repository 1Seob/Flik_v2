import { ChallengeVisibility } from '@prisma/client';

export type CreateChallengeData = {
  hostId: string;
  name: string;
  bookId: number;
  visibility: ChallengeVisibility;
  startTime: Date;
  endTime: Date;
};
