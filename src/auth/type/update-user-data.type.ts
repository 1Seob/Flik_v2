import { Gender } from '@prisma/client';

export type UpdateUserData = {
  loginId?: string | null;
  birthday?: Date | null;
  gender?: Gender | null;
  email?: string;
  password?: string;
  name?: string;
  refreshToken?: string | null;
  interestCategories?: number[] | null;
};
