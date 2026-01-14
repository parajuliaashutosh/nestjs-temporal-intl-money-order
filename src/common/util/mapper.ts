import { SupportedCountry } from '../enum/supported-country.enum';
import { SupportedCurrency } from '../enum/supported-currency.enum';
import { AppException } from '../exception/app.exception';

const countryToCurrencyMap = (country: SupportedCountry) => {
  switch (country) {
    case SupportedCountry.USA:
      return SupportedCurrency.USD;
    case SupportedCountry.AUS:
      return SupportedCurrency.AUD;
    default:
      throw AppException.badRequest('Unsupported country for currency mapping');
  }
};


export const Mapper = {
    countryToCurrencyMap,
};