import { Gender, AuthProvider } from '@prisma/client';

export type UserBaseInfo = {
  id: number;
  provider: AuthProvider;
  providerId: string;
  name: string;
  gender?: Gender | null;
  birthday?: Date | null;
  profileImagePath?: string | null;
  refreshToken: string | null;
};
