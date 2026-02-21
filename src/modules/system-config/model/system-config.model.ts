import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { BaseModel } from '@/src/common/model/base.model';

export interface SystemConfigModel extends BaseModel {
  countryCode: SupportedCountry;
  currency: SupportedCurrency;
  exchangeRate: string;
}
