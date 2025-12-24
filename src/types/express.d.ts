import { TokenPayload } from '../modules/auth/service/token/token.service';

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}
