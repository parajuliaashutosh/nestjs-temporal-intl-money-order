import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { UserDeviceDataDTO } from '../../login-log/dto/user-device-data.dto';
import { CreateAuthDTO } from '../dto/create-auth.dto';
import { LoginDTO } from '../dto/login.dto';
import { UpdatePasswordDTO } from '../dto/update-password.dto';
import { Auth } from '../entity/auth.entity';
import { PasswordHistory } from '../entity/password-history.entity';

export interface AuthContract {
  create(data: CreateAuthDTO): Promise<Auth>;
  login(
    data: LoginDTO,
    userDeviceData: UserDeviceDataDTO,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  refreshToken(
    refreshToken: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  getAuthById(id: string): Promise<Auth | null>;
  getProfile(id: string): Promise<Auth>;
  updatePassword(id: string, data: UpdatePasswordDTO): Promise<void>;
  getPasswordHistory(id: string): Promise<PasswordHistory[]>;
  getAuthByEmail(email: string): Promise<Auth | null>;
  getAuthByPhone(phone: string): Promise<Auth | null>;
  getAuthByUserIdAndCountry(
    userId: string,
    countryCode: SupportedCountry,
  ): Promise<Auth | null>;
}
