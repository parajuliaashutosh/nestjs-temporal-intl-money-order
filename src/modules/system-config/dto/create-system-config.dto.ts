import { IsNotBlank } from "@/src/common/decorator/validator/is-not-blank.decorator";
import { SupportedCountry } from "@/src/common/enum/supported-country.enum";
import { SupportedCurrency } from "@/src/common/enum/supported-currency.enum";
import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from "class-validator";


export class CreateSystemConfigDTO {

    @IsNotEmpty()
    @IsEnum(SupportedCountry)
    countryCode: SupportedCountry;

    @IsNotEmpty()
    @IsEnum(SupportedCurrency)
    currency: SupportedCurrency;

    @IsNotBlank()
    @IsNumber() 
    @IsPositive({ message: 'Exchange rate must be a positive number' })
    exchangeRate: number;
}