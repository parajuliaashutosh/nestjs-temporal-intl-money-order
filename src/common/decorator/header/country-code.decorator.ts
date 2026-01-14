import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { HEADER_COUNTRY_CODE_KEY } from '../../util/constant';

export const CountryCode = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.headers[HEADER_COUNTRY_CODE_KEY] as string;
  },
);
