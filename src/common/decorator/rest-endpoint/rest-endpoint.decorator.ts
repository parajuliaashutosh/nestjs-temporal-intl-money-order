import { Authenticate } from '@/src/common/decorator/authenticate/rest/authenticate.decorator';
import { Authorize } from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { KycVerified } from '@/src/common/decorator/authenticate/rest/kyc-verified/kyc-verified.decorator';
import { Role } from '@/src/common/enum/role.enum';
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOperationOptions,
  ApiParam,
  ApiParamOptions,
  ApiResponse,
  ApiResponseOptions,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

export enum ApiTag {
  Deprecated = 'deprecated',
}

export interface HistoryBuilder {
  getExtensions(): Record<string, unknown>;
  isDeprecated(): boolean;
}

export type EndpointOptions = ApiOperationOptions & {
  history?: HistoryBuilder;
  apiResponses?: ApiResponseOptions[];
  apiParams?: ApiParamOptions[];
  authenticated?: boolean;
  roles?: Role[];
  kycVerified?: boolean;
};

export const RestEndpoint = ({
  history,
  apiResponses,
  authenticated,
  roles,
  kycVerified,
  apiParams,
  ...options
}: EndpointOptions) => {
  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [];
  const extensions = history?.getExtensions() ?? {};

  if (history?.isDeprecated()) {
    options.deprecated = true;
    decorators.push(ApiTags(ApiTag.Deprecated));
  }

  const needsAuth = Boolean(
    authenticated || kycVerified || (roles?.length ?? 0) > 0,
  );

  if (kycVerified) {
    decorators.push(KycVerified());
  } else if ((roles?.length ?? 0) > 0) {
    decorators.push(Authorize(roles ?? []));
  } else if (needsAuth) {
    decorators.push(Authenticate());
  }

  if (needsAuth) {
    decorators.push(ApiSecurity('JWT-auth'));
    decorators.push(ApiSecurity('x-country-code'));
    decorators.push(
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication required',
      }),
    );
  }

  if ((roles?.length ?? 0) > 0) {
    decorators.push(
      ApiResponse({
        status: 403,
        description: `Forbidden - Required roles: ${(roles ?? []).join(', ')}`,
      }),
    );
  }

  if (kycVerified) {
    decorators.push(
      ApiResponse({
        status: 403,
        description: 'Forbidden - KYC should be verified',
      }),
    );
  }

  for (const param of apiParams ?? []) {
    decorators.push(ApiParam(param));
  }

  decorators.push(ApiOperation({ ...options, ...extensions }));

  for (const response of apiResponses ?? []) {
    decorators.push(ApiResponse(response));
  }

  return applyDecorators(...decorators);
};
