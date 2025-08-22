import { ChallengeVisibility } from '@prisma/client';

export type ChallengeData = {
  id: number;
  name: string;
  hostId: string;
  bookId: number;
  visibility: ChallengeVisibility;
  startTime: Date;
  endTime: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
};
