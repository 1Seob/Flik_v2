export type TokenSchema = {
  userId: string;
};

export type TokenPayload = TokenSchema & {
  iat: number;
  exp: number;
};
