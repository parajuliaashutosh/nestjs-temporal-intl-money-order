import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CountryCodePipe implements PipeTransform {
  transform(value: string): SupportedCountry {
    if (!value) {
      throw new BadRequestException('x-country-code header is required');
    }

    const normalized = value.toUpperCase();

    if (!Object.values(SupportedCountry).includes(normalized as SupportedCountry)) {
      throw new BadRequestException(
        `Invalid x-country-code. Allowed values: ${Object.values(SupportedCountry).join(', ')}`
      );
    }

    return normalized as SupportedCountry;
  }
}
