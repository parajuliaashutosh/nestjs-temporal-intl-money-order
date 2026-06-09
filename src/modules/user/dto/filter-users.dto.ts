import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';

export interface FilterUsersDTO {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  authId?: string;
  kycStatus?: KYCStatus;
  country?: SupportedCountry;
}
