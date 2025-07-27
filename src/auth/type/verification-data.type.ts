export type VerificationData = {
  email: string;
  code: string;
  createdAt: Date;
  expiredAt: Date;
  tryCount: number;
};
