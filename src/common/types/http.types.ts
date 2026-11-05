import type { NodeRequest, NodeResponse } from '@nestjs/platform-node';
import type { ReqUserPayload } from '../guard/rest/authentication.guard';

export type AppRequest = NodeRequest & {
  user: ReqUserPayload;
  cookies: Record<string, string | undefined>;
};

export type AppResponse = NodeResponse<AppRequest>;

export type NextFn = (err?: unknown) => void;
