import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CountryCodePipe implements PipeTransform {
  transform(value: string): SupportedCountry {
    if (!value) {
      throw AppException.badRequest('x-country-code header is required');
    }

    const normalized = value.toUpperCase();

    if (!Object.values(SupportedCountry).includes(normalized as SupportedCountry)) {
      throw AppException.badRequest(
        `Invalid x-country-code. Allowed values: ${Object.values(SupportedCountry).join(', ')}`
      );
    }

    return normalized as SupportedCountry;
  }
}
