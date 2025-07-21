import { Gender } from '@prisma/client';

export type UserData = {
  id: number;
  loginId: string;
  gender: Gender;
  birthday: Date;
  profileImageUrl?: string | null;
  email: string;
  name: string;
};
