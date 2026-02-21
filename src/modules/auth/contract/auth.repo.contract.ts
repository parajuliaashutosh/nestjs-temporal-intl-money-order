import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { Auth } from '../entity/auth.entity';
import { AuthModel } from '../model/auth.model';

export interface AuthRepoContract {
  create(auth: Partial<AuthModel>): Promise<Auth>;
  findByEmailOrPhoneForAuthentication(username: string): Promise<Auth | null>;
  findById(id: string): Promise<Auth | null>;
  getAuthByEmail(email: string): Promise<Auth | null>;
  getAuthByPhone(phone: string): Promise<Auth | null>;
  getAuthByUserIdAndCountry(
    userId: string,
    country: SupportedCountry,
  ): Promise<Auth | null>;
}
