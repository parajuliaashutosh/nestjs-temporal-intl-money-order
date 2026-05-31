import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { HEADER_COUNTRY_CODE_KEY } from '@/src/common/util/constant';
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CountryCodePipe implements PipeTransform {
  transform(value: string): SupportedCountry {
    if (!value) {
      throw AppException.badRequest(
        `${HEADER_COUNTRY_CODE_KEY} header is required`,
      );
    }

    const normalized = value.toUpperCase();

    if (
      !Object.values(SupportedCountry).includes(normalized as SupportedCountry)
    ) {
      throw AppException.badRequest(
        `Invalid ${HEADER_COUNTRY_CODE_KEY}. Allowed values: ${Object.values(SupportedCountry).join(', ')}`,
      );
    }

    return normalized as SupportedCountry;
  }
}
