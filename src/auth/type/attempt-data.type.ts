import { ActionType } from '@prisma/client';

export type AttemptData = {
  email: string;
  actionType: ActionType;
  attemptedAt: Date;
};
