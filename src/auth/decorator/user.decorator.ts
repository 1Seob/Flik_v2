import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithAuth } from '../type/request-with-auth.type';
import { UserBaseInfo } from '../type/user-base-info.type';

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): UserBaseInfo => {
    const request: RequestWithAuth = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
