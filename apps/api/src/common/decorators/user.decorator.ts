import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User decorator for extracting user from request
 * (Will be used when authentication is implemented)
 */
export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

