import { Gender } from '@prisma/client';

export type UserData = {
  id: number;
  supabaseId: string;
  gender?: Gender | null;
  birthday?: Date | null;
  profileImagePath?: string | null;
  name: string;
};
