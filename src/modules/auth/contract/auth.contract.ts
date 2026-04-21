import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { UserDeviceDataDTO } from '../../login-log/dto/user-device-data.dto';
import { CreateAuthDTO } from '../dto/create-auth.dto';
import { LoginDTO } from '../dto/login.dto';
import { Auth } from '../entity/auth.entity';

export interface AuthContract {
  create(data: CreateAuthDTO): Promise<Auth>;
  login(
    data: LoginDTO,
    userDeviceData: UserDeviceDataDTO,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  getAuthById(id: string): Promise<Auth | null>;
  getAuthByEmail(email: string): Promise<Auth | null>;
  getAuthByPhone(phone: string): Promise<Auth | null>;
  getAuthByUserIdAndCountry(
    userId: string,
    countryCode: SupportedCountry,
  ): Promise<Auth | null>;
}
