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

const currencyToCountryMap = (currency: SupportedCurrency) => {
  switch (currency) {
    case SupportedCurrency.USD:
      return SupportedCountry.USA;
    case SupportedCurrency.AUD:
      return SupportedCountry.AUS;
    default:
      throw AppException.badRequest('Unsupported currency for country mapping');
  }
};

export const Mapper = {
  countryToCurrencyMap,
  currencyToCountryMap,
};
