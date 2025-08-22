export const ChallengeStatus = {
  PREPARING: 'PREPARING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ChallengeStatus =
  (typeof ChallengeStatus)[keyof typeof ChallengeStatus];
