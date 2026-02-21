import { Auth } from '../entity/auth.entity';

export interface AuthRepoContract {
  create(auth: Partial<Auth>): Promise<Auth>;
  findByEmailOrPhoneForAuthentication(username: string): Promise<Auth | null>;
  findById(id: string): Promise<Auth | null>;
  getAuthByEmail(email: string): Promise<Auth | null>;
  getAuthByPhone(phone: string): Promise<Auth | null>;
}
