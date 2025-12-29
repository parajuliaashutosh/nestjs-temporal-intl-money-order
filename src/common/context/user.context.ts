import { TokenPayload } from '@/src/modules/auth/service/token/token.service';
import { AsyncLocalStorage } from 'async_hooks';
import { Role } from '../enum/role.enum';

export interface UserContextPayload {
  key: string;
  id: string;
  role: Role;
  userId?: string;
  adminId?: string;
  tokenPayload?: TokenPayload;
}

export class UserContext {
  constructor(public readonly payload: UserContextPayload) {}
}

export class UserContextStorage {
  private static storage = new AsyncLocalStorage<UserContext>();

  static get(): UserContext | undefined {
    return this.storage.getStore();
  }

  static run<T>(context: UserContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }
}
