import { UserBaseInfo } from './user-base-info.type';
import { Request } from 'express';

export type RequestWithAuth = Request & {
  headers: {
    authorization?: string;
  };
  user: UserBaseInfo;
};
