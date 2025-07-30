import { Gender } from '@prisma/client';

export type UserBaseInfo = {
  id: number;
  loginId: string;
  gender: Gender;
  birthday: Date;
  profileImagePath?: string | null;
  email: string;
  password: string;
  name: string;
  refreshToken: string | null;
};
