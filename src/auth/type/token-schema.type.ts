export type TokenSchema = {
  userId: number;
};

export type TokenPayload = TokenSchema & {
  iat: number;
  exp: number;
};
