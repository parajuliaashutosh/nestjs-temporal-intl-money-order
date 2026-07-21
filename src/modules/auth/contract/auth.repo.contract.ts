import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { Auth } from '../entity/auth.entity';
import { PasswordHistory } from '../entity/password-history.entity';
import { AuthModel } from '../model/auth.model';

export interface AuthRepoContract {
  create(auth: Partial<AuthModel>): Promise<Auth>;
  findByEmailOrPhoneForAuthentication(username: string): Promise<Auth | null>;
  findByIdForAuthentication(id: string): Promise<Auth | null>;
  findById(id: string): Promise<Auth | null>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  createPasswordHistory(
    authId: string,
    hashedPassword: string,
  ): Promise<PasswordHistory>;
  /** Most recent password hashes first. */
  getRecentPasswordHistories(
    authId: string,
    limit: number,
  ): Promise<PasswordHistory[]>;
  getPasswordHistories(authId: string): Promise<PasswordHistory[]>;
  getAuthByEmail(email: string): Promise<Auth | null>;
  getAuthByPhone(phone: string): Promise<Auth | null>;
  getAuthByUserIdAndCountry(
    userId: string,
    country: SupportedCountry,
  ): Promise<Auth | null>;
}
