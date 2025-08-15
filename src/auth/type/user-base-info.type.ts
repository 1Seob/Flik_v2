import { Gender } from '@prisma/client';

export type UserBaseInfo = {
  id: number;
  supabaseId: string;
  name: string;
  gender?: Gender | null;
  birthday?: Date | null;
  profileImagePath?: string | null;
};
