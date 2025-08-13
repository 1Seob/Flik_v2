import { Gender, AuthProvider } from '@prisma/client';

export type UserData = {
  id: number;
  provider: AuthProvider;
  providerId: string;
  gender?: Gender | null;
  birthday?: Date | null;
  profileImagePath?: string | null;
  name: string;
};
