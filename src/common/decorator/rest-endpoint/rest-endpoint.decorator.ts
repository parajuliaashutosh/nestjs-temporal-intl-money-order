import { Authenticate } from '@/src/common/decorator/authenticate/rest/authenticate.decorator';
import {
  Authorize,
  ROLES_KEY,
} from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { KycVerified } from '@/src/common/decorator/authenticate/rest/kyc-verified/kyc-verified.decorator';
import { Role } from '@/src/common/enum/role.enum';
import { DevWebhookSignatureGuard } from '@/src/common/guard/rest/dev-webhook-signature.guard';
import { NonProductionGuard } from '@/src/common/guard/rest/non-production.guard';
import {
  applyDecorators,
  CanActivate,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
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
  /** Disables the endpoint (404) outside of non-production environments. Default false. */
  devOnly?: boolean;
  /** Requires a valid `x-dev-signature` HMAC header, see DevWebhookSignatureGuard. Default false. */
  preSigned?: boolean;
};

export const RestEndpoint = ({
  history,
  apiResponses,
  authenticated,
  roles,
  kycVerified,
  apiParams,
  devOnly = false,
  preSigned = false,
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
    if ((roles?.length ?? 0) > 0) {
      decorators.push(SetMetadata(ROLES_KEY, roles ?? []));
    }
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

  const webhookGuards: Array<new (...args: never[]) => CanActivate> = [];

  if (devOnly) {
    webhookGuards.push(NonProductionGuard);
    decorators.push(
      ApiResponse({
        status: 404,
        description: 'Not found - endpoint is disabled in production',
      }),
    );
  }

  if (preSigned) {
    webhookGuards.push(DevWebhookSignatureGuard);
    decorators.push(
      ApiHeader({
        name: 'x-dev-signature',
        description:
          'HMAC-SHA256 signature of the raw request body, signed with WALLET_DEV_TOPUP_SIGNING_SECRET',
        required: true,
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - missing or invalid x-dev-signature',
      }),
    );
  }

  if (webhookGuards.length > 0) {
    decorators.push(UseGuards(...webhookGuards));
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
