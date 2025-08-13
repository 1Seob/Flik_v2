import { Gender } from '@prisma/client';

export type UpdateUserData = {
  birthday?: Date | null;
  gender?: Gender | null;
  name?: string;
  refreshToken?: string | null;
};
