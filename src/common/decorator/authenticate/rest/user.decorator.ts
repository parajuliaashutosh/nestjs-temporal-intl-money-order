import { TokenPayload } from '@/src/modules/auth/service/token/token.service';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AppRequest as Request } from '@/src/common/types/http.types';

export const User = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: TokenPayload }>();
    const user = request.user;
    if (data) {
      return user?.[data];
    }
    return user;
  },
);
