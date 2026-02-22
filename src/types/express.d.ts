import { ReqUserPayload } from '../common/guard/rest/authentication.guard';

declare global {
  namespace Express {
    interface Request {
      user: ReqUserPayload;
      cookies: {
        accessToken?: string;
        refreshToken?: string;
      };
    }
  }
}
